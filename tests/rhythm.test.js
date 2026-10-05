/* eslint-env es6 */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { createHash } = require('node:crypto')
async function check() {
  const { createNotes, judgeHit, expireNotes, DIFFICULTIES, HIT_WINDOW, PERFECT_WINDOW, APPROACH_MS } = await import('../src/rhythm.mjs')
  const { SONGS, songTimeline, LEAD_IN_MS } = await import('../src/songs.mjs')
  assert.equal(SONGS.length, 12)
  assert.equal(new Set(SONGS.map(s => s.id)).size, 12)
  assert.deepEqual(DIFFICULTIES.map(d => d.id), ['easy', 'normal', 'hard'])
  assert.ok(LEAD_IN_MS >= APPROACH_MS)
  const targetCounts = [42, 32, 26, 63, 549, 773, 1128, 934, 474, 387, 455, 889]
  assert.deepEqual(SONGS.map(song => createNotes(song).length), targetCounts, 'all 12 source-form charts preserve their verified target counts')
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
    const musicDuration = timeline.duration - LEAD_IN_MS - 700
    assert.ok(musicDuration >= 10000 && musicDuration <= 240000.001, song.id + ' follows its real form within the four-minute music cap')
    assert.ok(notes.at(-1).time > LEAD_IN_MS + musicDuration - 3000, song.id + ' remains playable through its closing phrase')
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
      const recordings = {
        electrodoodle: ['audio/electrodoodle-long.mp3', '3933bdcd67821ac168178f3e75cda27549818c7e49e4b4347ec615c5a53e810d'],
        'disco-medusae': ['audio/disco-medusae-complete.mp3', '0957c02613a361cd89b3f95ab8d0e708ded2849cc28787202e7a46931ff4bace'],
        'edm-detection-mode': ['audio/edm-detection-mode-opening.mp3', '3c93aa92e84d2648aa364f94d54f9a0eb903d15530e255badecf2dd66788246c'],
      }
      const [filename, sha256] = recordings[song.id]
      assert.equal(song.audioFile, filename, 'restored recordings use distinct cache-safe URLs')
      const audio = fs.readFileSync('public/' + filename)
      assert.equal(createHash('sha256').update(audio).digest('hex'), sha256, 'verified recording bytes are unchanged')
      assert.ok(audio.length > 2000000 && audio.length < 4000000, '128 kbps recordings stay below 4 MB each')
      if (song.id !== 'electrodoodle') {
        assert.equal(song.sourceStartMs, 0, 'recording begins at its original introduction')
        assert.equal(song.isExcerpt, song.audioDurationMs < song.sourceDurationMs)
        if (song.isExcerpt) assert.ok(song.subtitle.includes('발췌'), 'shortened recordings are labeled as excerpts')
      }
      assert.equal(musicDuration, song.audioDurationMs)
      assert.ok(song.beats.some(beat => beat * 60000 / song.bpm > 150000), 'recorded chart continues beyond the old short excerpt')
      assert.ok(song.beats.at(-1) * 60000 / song.bpm + HIT_WINDOW < song.audioDurationMs)
      assert.ok(song.credit.source.startsWith('https://'))
      assert.equal(song.targetLanes.length, notes.length, 'every recorded onset has an authored lane')
      assert.deepEqual(notes.map(note => note.side), song.targetLanes, 'recorded bar motifs are playable unchanged')
    } else if (song.score) {
      assert.equal(timeline.melody.length, song.score.sourcePlaybackCount, 'all source accompaniment and melody notes survive')
      assert.equal(timeline.bass.length, 0, 'no invented drone is added to complete scores')
      const onsetKeys = new Set(timeline.melody.map(note => `${note.time}:${note.midi}`))
      timeline.targets.forEach(note => assert.ok(onsetKeys.has(`${note.time}:${note.midi}`), 'every game target belongs to an actual played note'))
      assert.ok(song.score.sections.length >= 3, 'contrasting sections and cadence are represented')
      assert.equal(song.score.sections[0].time, 0)
      assert.ok(song.score.sections.at(-1).time > song.score.durationMs * .7)
      timeline.melody.forEach((note, i) => {
        assert.ok(note.duration > 0 && note.time + note.duration <= LEAD_IN_MS + musicDuration + 1)
        assert.ok(Number.isInteger(note.midi) && note.midi >= 0 && note.midi <= 127)
        assert.ok(note.gain > 0 && note.gain <= .16)
        assert.ok(i === 0 || note.time >= timeline.melody[i - 1].time)
      })
      assert.ok(song.credit.source.startsWith('https://') && song.credit.licenseUrl.startsWith('https://'))
    } else {
      assert.ok(song.melody.every(n => Number.isInteger(n.midi) && n.beats > 0))
      assert.ok(timeline.targets.every(n => n.midi !== null))
      const expectedBeats = { twinkle: 48, jacques: 32, mary: 32, ode: 64 }
      assert.equal(song.melody.reduce((sum, note) => sum + note.beats, 0), expectedBeats[song.id], 'one complete short tune/theme, with no extra whole-tune loops')
      assert.ok(musicDuration < 30000, 'short complete songs are not padded to a duration quota')
      const lastSound = timeline.targets.at(-1)
      assert.ok(LEAD_IN_MS + musicDuration - lastSound.time - lastSound.duration < 1, 'the short melody reaches its actual tonic ending')
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
  const eliseHook = chartFor('elise').slice(0, 5)
  assert.deepEqual(eliseHook, [eliseHook[0], eliseHook[1], eliseHook[0], eliseHook[1], eliseHook[0]])
  assert.equal(eliseHook[0] - eliseHook[1], 1, 'the semitone hook stays a neighboring-pad trill within the full pitch range')
  const ode = SONGS.find(song => song.id === 'ode')
  const odeEvents = songTimeline(ode).targets
  assert.ok(odeEvents.some(note => note.midi === 55), 'Ode includes the low dominant in its contrasting bridge')
  assert.ok(!odeEvents.some(note => note.time === LEAD_IN_MS + Math.round(48 * 60000 / ode.bpm)), 'the tied Ode note is not re-triggered at measure253')
  const byId = id => SONGS.find(song => song.id === id).score
  assert.equal(byId('elise').sourcePlaybackCount, 1041)
  assert.equal(byId('turkish').sourcePlaybackCount, 2810)
  assert.equal(byId('spring').sourcePlaybackCount, 3173)
  assert.equal(byId('tell').sourcePlaybackCount, 16922)
  assert.equal(byId('cancan').sourcePlaybackCount, 488)
  assert.ok(byId('elise').sections.some(section => section.label.startsWith('B:')))
  assert.ok(byId('elise').sections.some(section => section.label.startsWith('C:')))
  assert.ok(byId('spring').sections.some(section => section.label.includes('Thunderstorm')))
  assert.ok(byId('turkish').sections.some(section => section.label.includes('coda')))
  assert.ok(byId('cancan').sections.some(section => section.label.includes('G-major chorus')))
  assert.ok(byId('cancan').sections.some(section => section.label.includes('D-major chorus')))
  const edm = SONGS.find(song => song.id === 'edm-detection-mode')
  const edmSection = (start, end) => edm.beats.filter(beat => {
    const seconds = beat * 60 / edm.bpm
    return seconds >= start && seconds < end
  }).length
  const edmPhrase = bar => edm.beats.flatMap((beat, i) => {
    const position = (Math.round((beat - edm.firstBeatMs * edm.bpm / 60000) * 4) - bar * 16) / 4
    return position >= 0 && position < 4 ? [[Math.round(position * 4) / 4, edm.targetLanes[i]]] : []
  })
  assert.deepEqual(edmPhrase(16), edmPhrase(17), 'recurring synth phrases recall the same authored gesture')
  assert.notDeepEqual(edmPhrase(16), edmPhrase(56), 'the breakdown is not a recycled main phrase')
  assert.ok(edmSection(0, 30) > 0, 'the actual opening now has its own complete chart')
  assert.equal(edmSection(105, 135), 48, 'the original EDM breakdown keeps only three clear accents per bar')
  assert.ok(edmSection(135, 165) > edmSection(105, 135) * 2, 'the chart follows the full beat returning')
  assert.equal(edm.audioDurationMs, 240000, 'the excerpt ends on the original 128-bar section boundary')
  assert.equal(edmSection(238.125, 240), 2, 'the final transition follows its two remaining synth accents')
  const disco = SONGS.find(song => song.id === 'disco-medusae')
  assert.equal(disco.audioDurationMs, disco.sourceDurationMs, 'Disco Medusae retains the complete original recording')
  assert.ok(disco.beats[0] * 60000 / disco.bpm >= 240 / disco.bpm * 2 * 1000, 'the original rising introduction has no artificial beat targets')
  assert.ok(disco.beats.some(beat => beat * 60000 / disco.bpm < 10000), 'the first original phrase is playable')
  const overlap = [{ id: 0, side: 0, time: 1000 }, { id: 1, side: 0, time: 1250 }]
  assert.deepEqual(judgeHit(overlap, 0, 1220), { perfect: true })
  assert.equal(overlap[1].hit, true, 'nearest target wins an overlapping timing window')
  console.log('All 12 song charts passed: complete short tunes, verified full classical forms, no filler loops, four-minute cap, section-aware authored motifs, pitch contour, safe repeats, lead-in offsets, fixed categories, five lanes, synchronization, rests, rhythm density, shared timing boundaries, misses, replay, and mobile-sized audio assets.')
}
check().catch(error => { console.error(error); process.exitCode = 1 })
