/* eslint-env es6 */
const assert = require('node:assert/strict')
const fs = require('node:fs')
async function check() {
  const { createNotes, judgeHit, expireNotes, DIFFICULTIES, HIT_WINDOW, PERFECT_WINDOW, APPROACH_MS } = await import('../src/rhythm.mjs')
  const { SONGS, songTimeline, LEAD_IN_MS } = await import('../src/songs.mjs')
  assert.equal(SONGS.length, 12)
  assert.equal(new Set(SONGS.map(s => s.id)).size, 12)
  assert.deepEqual(DIFFICULTIES.map(d => d.id), ['easy', 'normal', 'hard'])
  assert.ok(LEAD_IN_MS >= APPROACH_MS)
  const density = { easy: [], normal: [], hard: [] }
  for (const song of SONGS) {
    const timeline = songTimeline(song), notes = createNotes(song)
    assert.ok(DIFFICULTIES.some(d => d.id === song.difficulty))
    assert.ok(timeline.duration > 20000 && timeline.duration < 50000, song.id + ' is a short round')
    assert.ok(notes.at(-1).time + HIT_WINDOW < timeline.duration)
    assert.equal(notes.length, timeline.targets.length, 'no filler notes or rest targets')
    assert.equal(new Set(notes.map(n => n.time)).size, notes.length)
    const lastLane = Array(5).fill(-Infinity)
    notes.forEach((note, i) => {
      assert.equal(note.id, i)
      assert.equal(note.time, timeline.targets[i].time, 'targets follow the song clock exactly')
      assert.ok(song.lanes.includes(note.side))
      assert.ok(note.time - lastLane[note.side] >= 220, 'no physically unfair same-pad run')
      assert.ok(i === 0 || note.time - notes[i - 1].time >= 105, 'fastest bursts remain playable')
      lastLane[note.side] = note.time
    })
    if (song.difficulty === 'easy') assert.ok(song.lanes.length <= 3)
    if (song.difficulty === 'hard') assert.equal(new Set(notes.map(n => n.side)).size, 5)
    if (song.audioFile) {
      assert.ok(fs.statSync('public/' + song.audioFile).size > 10000)
      assert.ok(song.beats.at(-1) * 60000 / song.bpm + HIT_WINDOW < song.audioDurationMs)
      assert.ok(song.credit.source.startsWith('https://'))
    } else {
      assert.ok(song.melody.every(n => (n.midi === null || Number.isInteger(n.midi)) && n.beats > 0))
      assert.ok(timeline.targets.every(n => n.midi !== null))
    }
    density[song.difficulty].push(notes.length / ((timeline.duration - LEAD_IN_MS - 700) / 1000))
    const fresh = () => createNotes(song)
    const first = notes[0]
    assert.equal(judgeHit(notes, -1, first.time), null, 'wrong pad must not score')
    assert.equal(judgeHit(notes, first.side, first.time - HIT_WINDOW - 1), null)
    assert.deepEqual(judgeHit(notes, first.side, first.time), { perfect: true })
    assert.equal(judgeHit(notes, first.side, first.time), null, 'one target cannot score twice')
    // Boundary tests isolate a target; a neighboring target must not mask an edge.
    for (const direction of [-1, 1]) {
      const single = () => [{ ...first, hit: false }]
      assert.deepEqual(judgeHit(single(), first.side, first.time + direction * HIT_WINDOW), { perfect: false })
      assert.deepEqual(judgeHit(single(), first.side, first.time + direction * PERFECT_WINDOW), { perfect: true })
      assert.deepEqual(judgeHit(single(), first.side, first.time + direction * (PERFECT_WINDOW + 1)), { perfect: false })
      assert.equal(judgeHit(single(), first.side, first.time + direction * (HIT_WINDOW + 1)), null)
    }
    const misses = fresh()
    assert.equal(expireNotes(misses, first.time + HIT_WINDOW), 0)
    assert.equal(expireNotes(misses, first.time + HIT_WINDOW + 1), 1)
    assert.equal(expireNotes(misses, first.time + HIT_WINDOW + 1), 0)
    assert.equal(judgeHit(misses, first.side, first.time), null)
    assert.equal(expireNotes(fresh(), timeline.duration), notes.length)
    assert.equal(fresh().filter(n => n.hit || n.missed).length, 0)
    console.log(`${song.id}/${song.difficulty}: ${notes.length} targets, ${(timeline.duration / 1000).toFixed(1)} s, shared ±${HIT_WINDOW} ms`)
  }
  assert.ok(density.hard.reduce((a, b) => a + b) / density.hard.length > density.easy.reduce((a, b) => a + b) / density.easy.length, 'difficulty comes from song rhythms')
  const overlap = [{ id: 0, side: 0, time: 1000 }, { id: 1, side: 0, time: 1250 }]
  assert.deepEqual(judgeHit(overlap, 0, 1220), { perfect: true })
  assert.equal(overlap[1].hit, true, 'nearest target wins an overlapping timing window')
  console.log('All 12 song charts passed: fixed categories, five lanes, synchronization, rests, rhythm density, shared timing boundaries, misses, replay, and audio assets.')
}
check().catch(error => { console.error(error); process.exitCode = 1 })
