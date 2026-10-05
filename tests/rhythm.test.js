/* eslint-env es6 */
const assert = require('node:assert/strict')
async function check() {
  const { createNotes, judgeHit, expireNotes, DIFFICULTIES } = await import('../src/rhythm.mjs')
  const { SONGS, songTimeline, LEAD_IN_MS } = await import('../src/songs.mjs')
  assert.equal(SONGS.length, 3)
  assert.equal(new Set(SONGS.map(s => s.id)).size, 3)
  assert.deepEqual(DIFFICULTIES.map(d => d.id), ['easy', 'normal', 'hard'])
  for (const song of SONGS) {
    const timeline = songTimeline(song)
    const counts = []
    for (const difficulty of DIFFICULTIES) {
      const notes = createNotes(song, difficulty)
      counts.push(notes.length)
      assert.ok(LEAD_IN_MS >= difficulty.approach)
      assert.ok(timeline.duration > 25000 && timeline.duration < 45000)
      assert.ok(notes.at(-1).time + difficulty.hitWindow < timeline.duration)
      assert.equal(new Set(notes.map(n => n.time)).size, notes.length, 'no duplicate or simultaneous targets')
      notes.forEach((note, i) => {
        assert.equal(note.id, i)
        assert.ok([0, 1].includes(note.side))
        assert.ok(i === 0 || note.time - notes[i - 1].time >= 258, 'all charts are physically playable on two pads')
        if (difficulty.id !== 'hard') assert.ok(timeline.melody.some(n => n.time === note.time), 'easy and normal targets match the melody')
        if (difficulty.id === 'easy') {
          assert.equal(note.side, i % 2)
          assert.ok(i === 0 || note.time - notes[i - 1].time >= 60000 / song.bpm * 1.5 - 1)
        }
      })
      if (difficulty.id === 'normal') assert.equal(notes.length, song.melody.length)
      if (difficulty.id === 'hard') {
        assert.ok(timeline.melody.every(n => notes.some(target => target.time === n.time)), 'hard retains every melody onset')
        assert.ok(notes.at(-1).time < timeline.duration - 700, 'no new targets in outro')
      }
      if (difficulty.id !== 'easy') {
        assert.ok(notes.some((n, i) => i && n.side === notes[i - 1].side), 'mixed patterns include double taps')
        assert.ok(notes.every((n, i) => i < 2 || n.side !== notes[i - 1].side || n.side !== notes[i - 2].side), 'no runs longer than two on one hand')
      }
      const fresh = () => createNotes(song, difficulty)
      const first = notes[0]
      assert.equal(judgeHit(notes, 1, first.time, difficulty), null, 'wrong pad must not score')
      assert.equal(judgeHit(notes, 0, first.time - difficulty.hitWindow - 1, difficulty), null)
      assert.deepEqual(judgeHit(notes, 0, first.time, difficulty), { perfect: true })
      assert.equal(judgeHit(notes, 0, first.time, difficulty), null, 'one note cannot score twice')
      for (const direction of [-1, 1]) {
        assert.deepEqual(judgeHit(fresh(), 0, first.time + direction * difficulty.hitWindow, difficulty), { perfect: false })
        assert.deepEqual(judgeHit(fresh(), 0, first.time + direction * difficulty.perfectWindow, difficulty), { perfect: true })
        assert.deepEqual(judgeHit(fresh(), 0, first.time + direction * (difficulty.perfectWindow + 1), difficulty), { perfect: false })
      }
      const misses = fresh()
      assert.equal(expireNotes(misses, first.time + difficulty.hitWindow, difficulty), 0)
      assert.equal(expireNotes(misses, first.time + difficulty.hitWindow + 1, difficulty), 1)
      assert.equal(expireNotes(misses, first.time + difficulty.hitWindow + 1, difficulty), 0)
      assert.equal(judgeHit(misses, 0, first.time, difficulty), null)
      assert.equal(expireNotes(fresh(), timeline.duration, difficulty), notes.length)
      assert.equal(fresh().filter(n => n.hit || n.missed).length, 0)
      console.log(`${song.id}/${difficulty.id}: ${notes.length} targets, ±${difficulty.hitWindow} ms`)
    }
    assert.ok(counts[0] < counts[1] && counts[1] < counts[2], 'each level is denser on every song')
  }
  console.log('All 9 charts passed: musical sync, density, hand patterns, timing boundaries, wrong/duplicate taps, misses, and replay.')
}
check().catch(error => { console.error(error); process.exitCode = 1 })
