/* eslint-env es6 */
const assert = require('node:assert/strict')
const fs = require('node:fs')

async function check() {
  const rhythm = await import('../src/rhythm.mjs')
  const songs = await import('../src/songs.mjs')
  const source = fs.readFileSync('src/components/BongoGame.vue', 'utf8').split('<script setup>')[1].split('</script>')[0].replace(/^import .+$/gm, '')
  const mounts = [], unmounts = [], oscillators = [], frames = new Map(), listeners = new Set(), storage = new Map(), timers = new Map()
  let context, clock = 0, nextId = 0
  const parameter = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} })
  class AudioContext {
    constructor() { context = this; this.currentTime = 0; this.state = 'running'; this.destination = {} }
    createGain() { return { gain: parameter(), connect() {}, disconnect() {} } }
    createOscillator() {
      const voice = { frequency: parameter(), connect() {}, disconnect() {}, start(when) { this.when = when }, stop(when) { if (when === undefined) this.cancelled = true } }
      oscillators.push(voice)
      return voice
    }
    close() { this.state = 'closed'; return Promise.resolve() }
  }
  const fakeEvents = { addEventListener: (event, fn) => listeners.add(fn), removeEventListener: (event, fn) => listeners.delete(fn) }
  const args = {
    ...rhythm, ...songs,
    ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }),
    onMounted: fn => mounts.push(fn), onUnmounted: fn => unmounts.push(fn),
    window: { AudioContext, ...fakeEvents }, document: { hidden: false, ...fakeEvents },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    performance: { now: () => clock },
    requestAnimationFrame: fn => { frames.set(++nextId, fn); return nextId }, cancelAnimationFrame: id => frames.delete(id),
    setTimeout: fn => { timers.set(++nextId, fn); return nextId }, clearTimeout: id => timers.delete(id),
  }
  const game = new Function(...Object.keys(args), source + '\nreturn { start, pause, resume, chooseSong, chooseDifficulty, freePlay, toggleMute, tap, finish, update, keydown, visibility, phase, score, best, notes, elapsed, duration, accuracy, selectedId, difficultyId, muted, combo, hits, visibleNotes, active };')(...Object.values(args))
  mounts.forEach(fn => fn())
  assert.equal(context, undefined, 'audio must not start before a user gesture')
  storage.set('bongo-cat-best-twinkle', '12345')
  const records = new Map()
  for (const song of songs.SONGS) for (const difficulty of rhythm.DIFFICULTIES) {
    game.chooseSong(song.id)
    game.chooseDifficulty(difficulty.id)
    assert.equal(game.best.value, 0, 'new chart records do not reuse incompatible old scores')
    game.start()
    assert.equal(game.phase.value, 'playing')
    assert.equal(frames.size, 1)
    assert.deepEqual(game.notes.value, rhythm.createNotes(song, difficulty))
    const scheduled = oscillators.slice(-song.melody.length - songs.songTimeline(song).bass.length)
    assert.ok(scheduled.every(v => Number.isFinite(v.when)), 'all music has a schedule')
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
    game.finish()
    assert.equal(frames.size, 0)
    assert.equal(game.best.value, expected)
    records.set(`${song.id}-${difficulty.id}`, expected)
    assert.equal(storage.get(`bongo-cat-best-v2-${song.id}-${difficulty.id}`), String(expected))
    game.start()
    assert.equal(game.score.value, 0)
    assert.equal(game.hits.value, 0)
    game.pause()
    assert.equal(game.phase.value, 'paused')
    assert.equal(frames.size, 0)
    assert.ok(oscillators.every(v => v.cancelled), 'pause stops all old voices')
    const stoppedAt = game.elapsed.value
    context.currentTime += 10; clock += 10000
    game.resume()
    assert.equal(game.elapsed.value, stoppedAt, 'resume excludes paused time')
    assert.equal(frames.size, 1)
    game.resume()
    assert.equal(frames.size, 1, 'repeated resume cannot duplicate loops')
    game.toggleMute(); assert.equal(game.muted.value, true)
    game.toggleMute(); assert.equal(game.muted.value, false)
    game.freePlay()
    assert.equal(timers.size, 0)
  }
  assert.equal(storage.get('bongo-cat-best-twinkle'), '12345', 'legacy records remain untouched')
  for (const song of songs.SONGS) for (const difficulty of rhythm.DIFFICULTIES) {
    game.chooseSong(song.id); game.chooseDifficulty(difficulty.id)
    assert.equal(game.best.value, records.get(`${song.id}-${difficulty.id}`), 'all nine records restore independently')
  }
  game.start()
  game.chooseDifficulty('hard')
  assert.equal(game.phase.value, 'playing', 'reselecting current difficulty does not reset')
  game.chooseDifficulty('invalid'); game.chooseSong('invalid')
  assert.equal(game.phase.value, 'playing', 'invalid selections are ignored')
  game.tap(0)
  game.chooseDifficulty('easy')
  assert.equal(game.phase.value, 'idle')
  assert.equal(game.elapsed.value, 0)
  assert.equal(game.score.value, 0)
  assert.equal(game.notes.value.length, 0)
  assert.deepEqual(game.active.value, [false, false])
  assert.equal(frames.size, 0)
  assert.equal(timers.size, 0)
  assert.ok(oscillators.every(v => v.cancelled), 'level change cancels every old voice')
  game.start(); game.pause(); game.chooseDifficulty('normal')
  assert.equal(game.phase.value, 'idle', 'paused level change resets too')
  game.start(); game.chooseSong('twinkle')
  assert.equal(game.phase.value, 'idle')
  assert.ok(oscillators.every(v => v.cancelled), 'song change cancels every old voice')
  game.start(); game.start()
  assert.equal(frames.size, 1, 'repeated start has only one animation loop')
  args.document.hidden = true; game.visibility()
  assert.equal(game.phase.value, 'paused')
  game.resume()
  unmounts.forEach(fn => fn())
  assert.equal(context.state, 'closed')
  assert.equal(listeners.size, 0)
  assert.equal(frames.size, 0)
  assert.equal(timers.size, 0)
  assert.ok(oscillators.every(v => v.cancelled), 'game exit stops all music')
  console.log('Lifecycle passed: all 9 full-perfect rounds and independent records, pause/resume, mute, replay, mid-play/paused level changes, song changes, repeated starts, background pause, and exit cleanup.')
}
check().catch(error => { console.error(error); process.exitCode = 1 })
