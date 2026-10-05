/* eslint-env es6 */
const assert = require('node:assert/strict')
async function check() {
  const { createNotes, judgeHit, expireNotes, HIT_WINDOW, APPROACH_MS } = await import('../src/rhythm.mjs')
  const { SONGS, songTimeline, LEAD_IN_MS } = await import('../src/songs.mjs')
  assert.equal(SONGS.length, 3)
  assert.equal(new Set(SONGS.map(s => s.id)).size, 3)
  for (const song of SONGS) {
    const timeline = songTimeline(song)
    const notes = createNotes(song)
    assert.equal(notes.length, song.melody.length)
    assert.ok(LEAD_IN_MS >= APPROACH_MS)
    assert.ok(timeline.duration > 25000 && timeline.duration < 45000)
    assert.ok(notes.at(-1).time + HIT_WINDOW < timeline.duration)
    notes.forEach((note, i) => {
      assert.equal(note.time, timeline.melody[i].time, 'every target matches a melody onset')
      assert.equal(note.side, i % 2)
      assert.ok(song.melody[i].midi >= 48 && song.melody[i].midi <= 76, 'melody uses a comfortable range')
      assert.ok(i === 0 || note.time - notes[i - 1].time > 200)
    })
    const first = notes[0]
    assert.equal(judgeHit(notes, 1, first.time), null, 'wrong pad must not score')
    assert.equal(judgeHit(notes, 0, first.time - 181), null, 'early taps must not score')
    assert.deepEqual(judgeHit(notes, 0, first.time), { perfect: true })
    assert.equal(judgeHit(notes, 0, first.time), null, 'one note cannot score twice')
    assert.deepEqual(judgeHit(notes, 1, notes[1].time + HIT_WINDOW), { perfect: false })
    assert.equal(expireNotes(notes, notes[2].time + HIT_WINDOW), 0)
    assert.equal(expireNotes(notes, notes[2].time + HIT_WINDOW + 1), 1)
    assert.equal(expireNotes(notes, notes[2].time + HIT_WINDOW + 1), 0)
    assert.equal(judgeHit(notes, 0, notes[2].time), null)
    const replay = createNotes(song)
    assert.equal(replay.filter(n => n.hit || n.missed).length, 0)
    assert.equal(expireNotes(replay, timeline.duration), replay.length)
    console.log(`${song.title}: ${notes.length} synchronized notes, ${(timeline.duration / 1000).toFixed(1)} seconds`)
  }
  console.log('Rhythm checks passed: all songs, timing, wrong pads, duplicate taps, misses, and replay.')
}
check().catch(error => { console.error(error); process.exitCode = 1 })
