/* eslint-env es6 */
const assert = require('node:assert/strict')
const fs = require('node:fs')

async function check() {
  const rhythm = await import('../src/rhythm.mjs')
  const songs = await import('../src/songs.mjs')
  const component = fs.readFileSync('src/components/BongoGame.vue', 'utf8')
  const style = component.split('<style scoped>')[1].split('</style>')[0]
  for (const selector of ['.club .studio{height:100vh;height:100dvh;', '.club .track{flex:1;min-height:320px;height:auto;']) {
    const index = style.indexOf(selector)
    assert.ok(index >= 0, 'tall studio and lane apply without a phase selector')
    const before = style.slice(0, index)
    assert.equal((before.match(/\{/g) || []).length, (before.match(/\}/g) || []).length, 'tall geometry is not inside a mobile-only media query')
  }
  assert.match(style, /@media\(max-height:480px\)\{[\s\S]*\.club \.studio\{min-height:0\}/, 'compact landscape controls apply at every width')
  const source = component.split('<script setup>')[1].split('</script>')[0].replace(/^import .+$/gm, '')
  const mounts = [], unmounts = [], voices = [], frames = new Map(), listeners = new Set(), storage = new Map(), timers = new Map()
  let mobile = false, observerDisconnected = false
  let context, clock = 0, nextId = 0, fetchMode = 'ok', releaseFetch, downloads = 0
  const parameter = () => ({ value: 0, setValueAtTime(value) { this.value = value }, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} })
  const voice = type => {
    const node = { type, frequency: parameter(), connect() {}, disconnect() {}, start(when, offset) { this.when = when; this.offset = offset }, stop(when) { if (when === undefined) this.cancelled = true } }
    voices.push(node)
    return node
  }
  class AudioContext {
    constructor() { context = this; this.currentTime = 0; this.state = 'running'; this.destination = {} }
    createGain() { return { gain: parameter(), connect() {}, disconnect() {} } }
    createOscillator() { return voice('oscillator') }
    createBufferSource() { return voice('buffer') }
    decodeAudioData(file) { return Promise.resolve({ duration: songs.SONGS.find(s => file.endsWith(s.audioFile || '!')).audioDurationMs / 1000 }) }
    close() { this.state = 'closed'; return Promise.resolve() }
  }
  const fakeEvents = { addEventListener: (event, fn) => listeners.add(fn), removeEventListener: (event, fn) => listeners.delete(fn) }
  const args = {
    ...rhythm, ...songs,
    ResizeObserver: class { observe() {} disconnect() { observerDisconnected = true } },
    nextTick: () => Promise.resolve(),
    ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }),
    onMounted: fn => mounts.push(fn), onUnmounted: fn => unmounts.push(fn),
    window: { AudioContext, matchMedia: () => ({ matches: mobile }), ...fakeEvents }, document: { hidden: false, ...fakeEvents },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    performance: { now: () => clock }, process: { env: { BASE_URL: '/sample-vue/' } },
    fetch: async file => {
      downloads++
      if (fetchMode === 'wait') await new Promise(resolve => { releaseFetch = resolve })
      return { ok: fetchMode !== 'fail', arrayBuffer: async () => file }
    },
    requestAnimationFrame: fn => { frames.set(++nextId, fn); return nextId }, cancelAnimationFrame: id => frames.delete(id),
    setTimeout: fn => { timers.set(++nextId, fn); return nextId }, clearTimeout: id => timers.delete(id),
  }
  const game = new Function(...Object.keys(args), source + '\nreturn { start, pause, resume, chooseSong, chooseDifficulty, freePlay, toggleMute, tap, update, keydown, visibility, phase, score, best, notes, elapsed, duration, accuracy, selectedId, difficultyId, filteredSongs, muted, combo, hits, active, pads, audioError, audioBuffers, SCROLL_SPEEDS, scrollMultiplier, chooseSpeed, accessibleTap, feedback, songPickerElement, showSongPicker, trackElement, trackHeight, measureTrack, hitLineY, approachMs, fallSpeed, noteY, roundLeadIn };')(...Object.values(args))
  mounts.forEach(fn => fn())
  assert.equal(context, undefined, 'audio never starts before a gesture')
  assert.equal(game.pads.length, 5)
  assert.equal(new Set(game.pads.map(p => p.high)).size, 5, 'five distinct percussion pitches')
  assert.deepEqual(game.pads.map(p => p.key), ['A', 'S', 'D', 'K', 'L'])
  storage.set('bongo-cat-best-twinkle', '12345')
  storage.set('bongo-cat-best-v2-twinkle-hard', '23456')
  storage.set('bongo-cat-best-v3-twinkle', '34567')
  storage.set('bongo-cat-best-v4-twinkle', '45678')
  const records = new Map()
  for (const song of songs.SONGS) {
    game.chooseSong(song.id)
    assert.equal(game.difficultyId.value, song.difficulty)
    assert.ok(game.filteredSongs.value.every(s => s.difficulty === song.difficulty))
    assert.equal(game.best.value, 0, 'two-pad and changed charts never reuse old scores')
    await game.start()
    assert.equal(game.phase.value, 'playing')
    assert.equal(frames.size, 1)
    assert.deepEqual(game.notes.value, rhythm.createNotes(song))
    assert.ok(game.audioBuffers.size <= 1, 'long recording cache never retains multiple decoded tracks')
    if (song.audioFile) {
      const buffer = voices.at(-1)
      assert.equal(buffer.type, 'buffer')
      assert.equal(buffer.when, context.currentTime + songs.LEAD_IN_MS / 1000)
      assert.equal(buffer.offset, 0)
    }
    const epoch = context.currentTime
    let expected = 0
    for (const note of game.notes.value) {
      context.currentTime = epoch + note.time / 1000
      clock = context.currentTime * 1000
      game.tap(note.side)
      expected += 100 + Math.min(note.id + 1, 20) * 2
      assert.equal(game.score.value, expected)
    }
    assert.equal(game.accuracy.value, 100)
    context.currentTime = epoch + game.duration.value / 1000 + .01
    game.update()
    assert.equal(game.phase.value, 'finished', 'round ends naturally')
    assert.equal(frames.size, 0)
    assert.equal(game.best.value, expected)
    records.set(song.id, expected)
    assert.equal(storage.get(`bongo-cat-best-v5-${song.id}`), String(expected))
    await game.start()
    assert.equal(game.score.value, 0)
    assert.equal(game.hits.value, 0)
    context.currentTime += 3
    clock += 3000
    game.pause()
    assert.equal(game.phase.value, 'paused')
    assert.equal(frames.size, 0)
    assert.ok(voices.every(v => v.cancelled), 'pause stops all tones and recorded sources')
    const stoppedAt = game.elapsed.value
    context.currentTime += 10; clock += 10000
    game.resume()
    assert.equal(game.elapsed.value, stoppedAt, 'resume excludes paused time')
    if (song.audioFile) assert.equal(voices.at(-1).offset, (stoppedAt - songs.LEAD_IN_MS) / 1000, 'recording resumes at matching chart position')
    assert.equal(frames.size, 1)
    game.resume()
    assert.equal(frames.size, 1, 'repeated resume cannot duplicate loops')
    game.toggleMute(); assert.equal(game.muted.value, true)
    game.toggleMute(); assert.equal(game.muted.value, false)
    game.freePlay()
    assert.equal(timers.size, 0)
  }
  assert.equal(downloads, 3, 'recordings are cached for replay')
  assert.equal(storage.get('bongo-cat-best-twinkle'), '12345')
  assert.equal(storage.get('bongo-cat-best-v2-twinkle-hard'), '23456')
  assert.equal(storage.get('bongo-cat-best-v3-twinkle'), '34567')
  assert.equal(storage.get('bongo-cat-best-v4-twinkle'), '45678')
  for (const song of songs.SONGS) {
    game.chooseSong(song.id)
    assert.equal(game.best.value, records.get(song.id), '12 song records restore independently')
  }
  for (const level of rhythm.DIFFICULTIES) {
    game.chooseDifficulty(level.id)
    assert.ok(game.filteredSongs.value.length >= 3)
    assert.equal(songs.SONGS.find(s => s.id === game.selectedId.value).difficulty, level.id)
  }
  await game.start()
  game.chooseDifficulty(game.difficultyId.value)
  game.chooseDifficulty('invalid'); game.chooseSong('invalid')
  assert.equal(game.phase.value, 'playing', 'invalid or current selection is harmless')
  for (const [side, key] of ['a', 's', 'd', 'k', 'l'].entries()) {
    game.keydown({ key, target: { tagName: 'BODY' }, preventDefault() {} })
    assert.equal(game.active.value[side], true)
  }
  game.chooseDifficulty('easy')
  assert.equal(game.phase.value, 'idle')
  assert.equal(game.elapsed.value, 0)
  assert.equal(game.score.value, 0)
  assert.equal(game.notes.value.length, 0)
  assert.deepEqual(game.active.value, Array(5).fill(false))
  assert.equal(frames.size, 0)
  assert.equal(timers.size, 0)
  assert.ok(voices.every(v => v.cancelled))
  await game.start(); game.pause(); game.chooseDifficulty('normal')
  assert.equal(game.phase.value, 'idle', 'paused category change resets')
  await game.start(); game.chooseSong('twinkle')
  assert.equal(game.phase.value, 'idle')
  assert.ok(voices.every(v => v.cancelled))
  await game.start(); await game.start()
  assert.equal(frames.size, 1, 'repeated start has one loop')
  args.document.hidden = true; game.visibility()
  assert.equal(game.phase.value, 'paused')
  args.document.hidden = false
  // Wrong presses cost 50, clamp at zero, and never penalize inactive/count-in input.
  game.chooseSong('twinkle')
  await game.start()
  const penaltyEpoch = context.currentTime
  game.score.value = 100
  context.currentTime = penaltyEpoch + .1
  game.tap(1)
  assert.equal(game.score.value, 100, 'count-in practice is free')
  context.currentTime = penaltyEpoch + game.notes.value[0].time / 1000
  game.tap(game.notes.value[0].side)
  assert.equal(game.score.value, 202, 'correct hits retain their existing points')
  context.currentTime += .01
  game.tap(1)
  assert.equal(game.score.value, 152, 'wrong lane loses 50 points')
  assert.equal(game.combo.value, 0)
  assert.equal(game.feedback.value, '-50점')
  game.accessibleTap({ detail: 1 }, 1)
  assert.equal(game.score.value, 152, 'pointer click following pointerdown is not counted twice')
  game.keydown({ key: 's', repeat: true, target: { tagName: 'BODY' }, preventDefault() {} })
  assert.equal(game.score.value, 152, 'held key repeats cannot repeat a hit or penalty')
  game.score.value = 30
  game.accessibleTap({ detail: 0 }, 1)
  assert.equal(game.score.value, 0)
  assert.equal(game.feedback.value, '-30점', 'feedback shows the actual deduction near zero')
  for (let i = 0; i < 10; i++) game.tap(1)
  assert.equal(game.score.value, 0, 'spamming never makes score negative or earns points')
  game.score.value = 100
  context.currentTime = penaltyEpoch + (game.notes.value[0].time + 300) / 1000
  game.tap(0)
  assert.equal(game.score.value, 50, 'pressing between hit windows also loses points')
  game.pause(); game.tap(1)
  assert.equal(game.score.value, 50, 'paused input is free')
  game.resume()
  context.currentTime = penaltyEpoch + game.duration.value / 1000 + 1
  game.update()
  const finishedScore = game.score.value
  game.tap(1)
  assert.equal(game.score.value, finishedScore, 'finished input is free')
  game.freePlay(); game.tap(1)
  assert.equal(game.score.value, 0, 'idle input is free')
  // A phone-sized playing field gives more preview, without accelerating the notes.
  mobile = true
  game.trackElement.value = { clientHeight: 680 }
  for (const id of ['twinkle', 'elise', 'turkish', 'electrodoodle']) {
    game.chooseSong(id)
    await game.start()
    const song = songs.SONGS.find(s => s.id === id)
    const oldHeight = { easy: 86, normal: 140, hard: 180 }[song.difficulty]
    assert.equal(game.fallSpeed.value, (oldHeight - 2) * .8 / rhythm.APPROACH_MS)
    assert.equal(game.hitLineY.value, 656)
    assert.ok(game.approachMs.value > rhythm.APPROACH_MS * 3)
    assert.equal(game.roundLeadIn.value, Math.ceil(game.approachMs.value + 200))
    assert.deepEqual(game.notes.value, rhythm.createNotes(song, game.roundLeadIn.value))
    const first = game.notes.value[0]
    assert.ok(first.time >= game.approachMs.value + 200, 'first note gets a full approach')
    game.elapsed.value = first.time - 500
    const y = game.noteY(first)
    game.elapsed.value += 100
    assert.ok(Math.abs(game.noteY(first) - y - game.fallSpeed.value * 100) < 1e-8)
    game.elapsed.value = first.time
    assert.equal(game.noteY(first), game.hitLineY.value, 'hit center and audio clock agree')
    if (song.audioFile) {
      assert.equal(voices.at(-1).when, context.currentTime + game.roundLeadIn.value / 1000)
      context.currentTime += (game.roundLeadIn.value + 700) / 1000
      game.pause()
      const paused = game.elapsed.value
      context.currentTime += 5
      game.resume()
      assert.equal(voices.at(-1).offset, (paused - game.roundLeadIn.value) / 1000, 'long-preview audio resumes in sync')
    }
    const speed = game.fallSpeed.value, lead = game.roundLeadIn.value
    game.pause()
    game.trackElement.value.clientHeight = 560
    game.measureTrack()
    assert.equal(game.fallSpeed.value, speed, 'viewport resize never accelerates notes')
    assert.equal(game.roundLeadIn.value, lead, 'resize never rewrites the song clock')
    game.resume()
    game.trackElement.value.clientHeight = 680
    game.measureTrack()
    game.freePlay()
    assert.equal(game.roundLeadIn.value, songs.LEAD_IN_MS)
  }
  // Tall ready/playing/paused geometry is shared by desktop, tablet and phones.
  for (const isPhone of [false, true]) {
    mobile = isPhone
    game.trackElement.value = { clientHeight: 600 }
    game.chooseSong('twinkle')
    game.freePlay()
    game.measureTrack()
    const readyLine = game.hitLineY.value
    assert.equal(readyLine, 576, 'ready mode uses the full lane')
    await game.start()
    assert.equal(game.hitLineY.value, readyLine, 'start never changes lane geometry')
    const lead = game.roundLeadIn.value
    assert.ok(lead > 7000, 'desktop and mobile both get a full-height lead-in')
    game.pause()
    assert.equal(game.hitLineY.value, readyLine, 'pause never collapses the lane')
    game.resume()
    assert.equal(game.hitLineY.value, readyLine)
    assert.equal(game.roundLeadIn.value, lead)
    let revealed = false
    game.songPickerElement.value = { scrollIntoView() { revealed = true } }
    await game.showSongPicker()
    assert.equal(game.phase.value, 'idle')
    assert.equal(revealed, true, 'song selection is reachable from the tall field')
    assert.equal(game.hitLineY.value, readyLine, 'returning to ready keeps the lane tall')
  }
  mobile = false
  game.trackElement.value = null
  game.measureTrack()
  // Four selectable scroll rates change only travel speed and matching count-in.
  assert.deepEqual(game.SCROLL_SPEEDS, [1, 2, 4, 8])
  for (const id of ['twinkle', 'elise', 'turkish', 'electrodoodle']) {
    game.chooseSong(id)
    const song = songs.SONGS.find(s => s.id === id)
    const normalTimeline = songs.songTimeline(song)
    for (const multiplier of game.SCROLL_SPEEDS) {
      game.chooseSpeed(multiplier)
      game.trackElement.value = { clientHeight: 600 }
      await game.start()
      assert.equal(game.scrollMultiplier.value, multiplier)
      const referenceHeight = { easy: 107, normal: 150, hard: 190 }[song.difficulty]
      assert.equal(game.fallSpeed.value, (referenceHeight - 2) * .8 / rhythm.APPROACH_MS * multiplier)
      const speed = game.fallSpeed.value, lead = game.roundLeadIn.value
      assert.ok(Math.abs(game.duration.value - lead - normalTimeline.duration + songs.LEAD_IN_MS) < 1e-6, 'music never speeds up')
      assert.deepEqual(game.notes.value.map(n => ({ side: n.side, relativeTime: n.time - lead })), rhythm.createNotes(song).map(n => ({ side: n.side, relativeTime: n.time - songs.LEAD_IN_MS })), 'chart rhythm and lanes are unchanged')
      assert.ok(game.notes.value[0].time >= game.approachMs.value + 199)
      const last = game.notes.value.at(-1)
      game.elapsed.value = last.time
      assert.equal(game.noteY(last), game.hitLineY.value, 'final note reaches the line at the same musical time')
      game.pause()
      game.trackElement.value.clientHeight = 680
      game.measureTrack()
      game.resume()
      assert.equal(game.fallSpeed.value, speed)
      assert.equal(game.roundLeadIn.value, lead, 'resize and resume preserve the song clock')
      game.chooseSpeed(3)
      assert.equal(game.phase.value, 'playing', 'invalid speed cannot disrupt playback')
      game.chooseSpeed(multiplier === 8 ? 1 : 8)
      assert.equal(game.phase.value, 'idle', 'changing speed resets instead of teleporting active notes')
      assert.equal(game.notes.value.length, 0)
    }
  }
  game.chooseSpeed(1)
  game.trackElement.value = null
  // Failed download is retryable; stale asynchronous loads cannot start a different song.
  const recording = songs.SONGS.find(s => s.audioFile)
  game.audioBuffers.clear(); game.chooseSong(recording.id); fetchMode = 'fail'
  await game.start()
  assert.equal(game.phase.value, 'idle')
  assert.ok(game.audioError.value)
  assert.equal(frames.size, 0)
  fetchMode = 'wait'
  const pending = game.start()
  assert.equal(game.phase.value, 'loading')
  game.chooseSong('mary'); releaseFetch(); await pending
  assert.equal(game.phase.value, 'idle')
  assert.equal(game.selectedId.value, 'mary')
  assert.equal(game.audioBuffers.size, 0, 'stale downloads never repopulate the recording cache')
  assert.equal(frames.size, 0)
  fetchMode = 'ok'; game.chooseSong(recording.id); await game.start()
  assert.equal(game.phase.value, 'playing')
  game.audioBuffers.clear(); game.freePlay(); fetchMode = 'wait'
  const hiddenLoad = game.start()
  args.document.hidden = true; game.visibility(); releaseFetch(); await hiddenLoad
  assert.equal(game.phase.value, 'idle', 'a background load never starts playback')
  args.document.hidden = false; fetchMode = 'ok'; await game.start()
  unmounts.forEach(fn => fn())
  assert.equal(context.state, 'closed')
  assert.equal(observerDisconnected, true, 'track resize observer is cleaned up')
  assert.equal(listeners.size, 0)
  assert.equal(frames.size, 0)
  assert.equal(timers.size, 0)
  assert.ok(voices.every(v => v.cancelled), 'exit stops all music')
  console.log('Lifecycle passed: 12 perfect rounds, record isolation, five keys/sounds, cache/seek, pause/resume, mute, replay, selection changes, load failure/retry/races, background pause, phone viewport preview/speed/resize, and exit cleanup.')
}
check().catch(error => { console.error(error); process.exitCode = 1 })
