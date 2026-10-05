/* eslint-env es6 */
const assert = require('node:assert/strict')
const fs = require('node:fs')

async function check() {
  const rhythm = await import('../src/rhythm.mjs')
  const songs = await import('../src/songs.mjs')
  const source = fs.readFileSync('src/components/BongoGame.vue', 'utf8').split('<script setup>')[1].split('</script>')[0].replace(/^import .+$/gm, '')
  const mounts = [], unmounts = [], voices = [], frames = new Map(), listeners = new Set(), storage = new Map(), timers = new Map()
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
    ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }),
    onMounted: fn => mounts.push(fn), onUnmounted: fn => unmounts.push(fn),
    window: { AudioContext, ...fakeEvents }, document: { hidden: false, ...fakeEvents },
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
  const game = new Function(...Object.keys(args), source + '\nreturn { start, pause, resume, chooseSong, chooseDifficulty, freePlay, toggleMute, tap, update, keydown, visibility, phase, score, best, notes, elapsed, duration, accuracy, selectedId, difficultyId, filteredSongs, muted, combo, hits, active, pads, audioError, audioBuffers };')(...Object.values(args))
  mounts.forEach(fn => fn())
  assert.equal(context, undefined, 'audio never starts before a gesture')
  assert.equal(game.pads.length, 5)
  assert.equal(new Set(game.pads.map(p => p.high)).size, 5, 'five distinct percussion pitches')
  assert.deepEqual(game.pads.map(p => p.key), ['A', 'S', 'D', 'K', 'L'])
  storage.set('bongo-cat-best-twinkle', '12345')
  storage.set('bongo-cat-best-v2-twinkle-hard', '23456')
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
    assert.equal(storage.get(`bongo-cat-best-v3-${song.id}`), String(expected))
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
  assert.equal(listeners.size, 0)
  assert.equal(frames.size, 0)
  assert.equal(timers.size, 0)
  assert.ok(voices.every(v => v.cancelled), 'exit stops all music')
  console.log('Lifecycle passed: 12 perfect rounds, record isolation, five keys/sounds, cache/seek, pause/resume, mute, replay, selection changes, load failure/retry/races, background pause, and exit cleanup.')
}
check().catch(error => { console.error(error); process.exitCode = 1 })
