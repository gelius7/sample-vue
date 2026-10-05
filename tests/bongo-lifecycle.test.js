/* eslint-env es6 */
const assert = require('node:assert/strict')
const fs = require('node:fs')

async function check() {
  const rhythm = await import('../src/rhythm.mjs')
  const songs = await import('../src/songs.mjs')
  const source = fs.readFileSync('src/components/BongoGame.vue', 'utf8').split('<script setup>')[1].split('</script>')[0].replace(/^import .+$/gm, '')
  const mounts = [], unmounts = [], oscillators = [], frames = new Set(), listeners = new Set(), storage = new Map()
  let context, clock = 0, frameId = 0
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
    requestAnimationFrame: () => { frames.add(++frameId); return frameId }, cancelAnimationFrame: id => frames.delete(id),
    setTimeout: () => 1, clearTimeout() {},
  }
  const game = new Function(...Object.keys(args), source + '\nreturn { start, pause, resume, chooseSong, freePlay, toggleMute, tap, finish, phase, score, best, notes, elapsed, duration, accuracy, selectedId, muted };')(...Object.values(args))
  mounts.forEach(fn => fn())
  assert.equal(context, undefined, 'audio must not start before a user gesture')
  for (const song of songs.SONGS) {
    game.chooseSong(song.id)
    game.start()
    assert.equal(game.phase.value, 'playing')
    assert.equal(game.notes.value.length, song.melody.length)
    const scheduled = oscillators.slice(-song.melody.length - songs.songTimeline(song).bass.length)
    assert.ok(scheduled.every(v => Number.isFinite(v.when)), 'all audio has a schedule')
    context.currentTime += game.notes.value[0].time / 1000
    clock += game.notes.value[0].time
    game.tap(0)
    assert.equal(game.score.value, 102)
    game.tap(0)
    assert.equal(game.score.value, 102, 'duplicate taps do not score')
    game.pause()
    assert.equal(game.phase.value, 'paused')
    assert.ok(scheduled.every(v => v.cancelled), 'pause stops scheduled music')
    const stoppedAt = game.elapsed.value
    context.currentTime += 10; clock += 10000
    game.resume()
    assert.equal(game.elapsed.value, stoppedAt, 'resume does not count paused time')
    game.toggleMute(); assert.equal(game.muted.value, true)
    game.toggleMute(); assert.equal(game.muted.value, false)
    game.finish()
    assert.equal(game.best.value, 102)
    assert.ok(game.accuracy.value > 0)
    game.start(); assert.equal(game.score.value, 0)
  }
  game.chooseSong('twinkle')
  assert.equal(game.phase.value, 'idle')
  assert.equal(game.elapsed.value, 0)
  assert.equal(game.score.value, 0)
  assert.equal(game.best.value, 102, 'best score is isolated and restored for each song')
  assert.ok(oscillators.every(v => v.cancelled), 'song changes stop every old voice')
  game.start()
  unmounts.forEach(fn => fn())
  assert.equal(context.state, 'closed')
  assert.equal(listeners.size, 0)
  assert.equal(frames.size, 0)
  assert.ok(oscillators.every(v => v.cancelled), 'game exit stops all music')
  console.log('Bongo lifecycle passed: gesture, all songs, scoring, pause/resume, mute, replay, song change, best records, and exit cleanup.')
}
check().catch(error => { console.error(error); process.exitCode = 1 })
