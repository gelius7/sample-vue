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
  const targetCounts = [42, 64, 52, 60, 70, 73, 152, 168, 122, 80, 75, 133]
  assert.deepEqual(SONGS.map(song => createNotes(song).length), targetCounts, 'lane edits preserve all 12 chart lengths')
  const density = { easy: [], normal: [], hard: [] }
  for (const song of SONGS) {
    const timeline = songTimeline(song), notes = createNotes(song)
    assert.deepEqual(createNotes(song), notes, song.id + ' has a deterministic chart')
    const extraLeadIn = 1600
    const shifted = songTimeline(song, LEAD_IN_MS + extraLeadIn)
    for (const part of ['melody', 'bass', 'targets']) {
      assert.equal(shifted[part].length, timeline[part].length)
      shifted[part].forEach((event, i) => {
        assert.ok(Math.abs(event.time - timeline[part][i].time - extraLeadIn) < 1e-6, 'lead-in shifts audio and targets equally')
        assert.deepEqual({ ...event, time: 0 }, { ...timeline[part][i], time: 0 }, 'lead-in preserves pitches, durations and lanes')
      })
    }
    assert.ok(Math.abs(shifted.duration - timeline.duration - extraLeadIn) < 1e-6)
    assert.deepEqual(createNotes(song, LEAD_IN_MS + extraLeadIn), notes.map(note => ({ ...note, time: note.time + extraLeadIn })))
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
    const cyclicSteps = notes.slice(1).filter((note, i) =>
      song.lanes.indexOf(note.side) === (song.lanes.indexOf(notes[i].side) + 1) % song.lanes.length)
    assert.ok(cyclicSteps.length < (notes.length - 1) * .65, song.id + ' is not a cyclic lane walk')
    if (song.audioFile) {
      assert.ok(fs.statSync('public/' + song.audioFile).size > 10000)
      assert.ok(song.beats.at(-1) * 60000 / song.bpm + HIT_WINDOW < song.audioDurationMs)
      assert.ok(song.credit.source.startsWith('https://'))
      assert.equal(song.targetLanes.length, notes.length, 'every recorded onset has an authored lane')
      assert.deepEqual(notes.map(note => note.side), song.targetLanes, 'recorded bar motifs are playable unchanged')
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
  const pitchLanes = (pitches, beats = .5) => createNotes({
    bpm: 120, lanes: [0, 1, 2, 3, 4],
    melody: pitches.map(midi => ({ midi, beats })),
  }).map(note => note.side)
  assert.deepEqual(pitchLanes([60, 62, 64, 65, 67, 65, 64, 62, 60]), [0, 1, 2, 3, 4, 3, 2, 1, 0], 'rising and falling phrases follow pitch')
  assert.deepEqual(pitchLanes([60, 64, 64, 64, 67]), [0, 2, 2, 2, 4], 'playable repeated pitches keep their pad')
  assert.deepEqual(pitchLanes([60, 64, 64, 64, 64, 64, 67], .25), [0, 2, 3, 2, 3, 2, 4], 'quick repeats alternate neighboring pads without drifting')
  const chartFor = id => createNotes(SONGS.find(song => song.id === id)).map(note => note.side)
  assert.deepEqual(chartFor('mary').slice(0, 7), [4, 2, 0, 2, 4, 4, 4], 'the nursery melody keeps its recognizable contour')
  assert.deepEqual(chartFor('elise').slice(0, 5), [4, 3, 4, 3, 4], 'the semitone hook becomes a neighboring-pad trill')
  assert.deepEqual(chartFor('edm-detection-mode').slice(0, 7), chartFor('edm-detection-mode').slice(7, 14), 'recorded phrases recall their authored motif')
  const overlap = [{ id: 0, side: 0, time: 1000 }, { id: 1, side: 0, time: 1250 }]
  assert.deepEqual(judgeHit(overlap, 0, 1220), { perfect: true })
  assert.equal(overlap[1].hit, true, 'nearest target wins an overlapping timing window')
  console.log('All 12 song charts passed: pitch contour, authored motifs, safe repeats, lead-in offsets, fixed categories, five lanes, synchronization, rests, rhythm density, shared timing boundaries, misses, replay, and audio assets.')
}
check().catch(error => { console.error(error); process.exitCode = 1 })
