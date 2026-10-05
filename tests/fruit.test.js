/* eslint-env es6 */
const assert = require('node:assert/strict')
const fs = require('node:fs')

async function test() {
  const { createWorld, dropFruit, stepWorld, FRUITS, WIDTH, HEIGHT, STEP } = await import('../src/fruit.mjs')
  const world = createWorld()
  dropFruit(world, 0, -100)
  assert.equal(world.fruits[0].x, FRUITS[0].radius + 6, 'drops stay inside the left wall')
  dropFruit(world, 0, 20)
  const merges = stepWorld(world)
  assert.equal(merges.length, 1)
  assert.equal(world.fruits.length, 1, 'two cherries become exactly one strawberry')
  assert.equal(world.fruits[0].level, 1)
  assert.equal(world.score, FRUITS[1].points, 'merge awards the created fruit score exactly once')
  for (let i = 0; i < 600; i++) stepWorld(world)
  assert.equal(world.score, FRUITS[1].points)
  assert.ok(world.fruits[0].y <= HEIGHT - world.fruits[0].radius - 8)
  assert.ok(world.fruits[0].x >= world.fruits[0].radius)
  assert.equal(world.over, false, 'an ordinary falling fruit never triggers overflow')

  const chain = createWorld()
  for (let i = 0; i < 4; i++) dropFruit(chain, 0, WIDTH / 2)
  stepWorld(chain)
  assert.equal(chain.fruits.length, 1)
  assert.equal(chain.fruits[0].level, 2)
  assert.equal(chain.score, 2 * FRUITS[1].points + FRUITS[2].points, 'chain merges score each pair once')

  const max = createWorld()
  dropFruit(max, 10, 150)
  dropFruit(max, 10, 180)
  stepWorld(max)
  assert.equal(max.fruits.length, 2, 'watermelons do not merge beyond the final fruit')
  assert.equal(max.score, 0)
  assert.ok(max.fruits.every(fruit => Number.isFinite(fruit.x) && Number.isFinite(fruit.vy)))

  const overflowing = createWorld()
  const blocked = dropFruit(overflowing, 1, 150)
  for (let i = 0; i < 400; i++) {
    blocked.y = 50
    blocked.vy = 0
    stepWorld(overflowing, STEP)
  }
  assert.equal(overflowing.over, true, 'fruit persistently above the rim ends the round')
  const count = overflowing.fruits.length
  assert.equal(dropFruit(overflowing, 0, 100), null)
  assert.equal(overflowing.fruits.length, count, 'game over rejects drops')
  assert.equal(createWorld().score, 0, 'restart creates clean state')
  checkLifecycle(await import('../src/fruit.mjs'))
  console.log('Fruit physics, bounds, chain merge, scoring, final fruit, overflow, restart, inputs, pause, storage, and exit cleanup passed.')
}
function checkLifecycle(engine) {
  const source = fs.readFileSync('src/components/WatermelonGame.vue', 'utf8').split('<script setup>')[1].split('</script>')[0].replace(/^import .+$/gm, '')
  const mounts = [], unmounts = [], frames = new Map(), listeners = new Map(), storage = new Map()
  let frameId = 0, clock = 0
  const context = new Proxy({}, { get: (target, key) => target[key] || (() => {}) })
  const capture = new Set()
  const fakeCanvas = {
    getContext: () => context, focus() {}, getBoundingClientRect: () => ({ left: 0, width: engine.WIDTH }),
    setPointerCapture: id => capture.add(id), hasPointerCapture: id => capture.has(id), releasePointerCapture: id => capture.delete(id),
  }
  const events = { addEventListener: (event, fn) => listeners.set(event, fn), removeEventListener: event => listeners.delete(event) }
  const document = { hidden: false, ...events }
  const args = {
    ...engine,
    ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }), nextTick: fn => fn(),
    onMounted: fn => mounts.push(fn), onUnmounted: fn => unmounts.push(fn),
    window: { devicePixelRatio: 2, matchMedia: () => ({ matches: false }), ...events }, document,
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId }, cancelAnimationFrame: id => frames.delete(id),
  }
  const game = new Function(...Object.keys(args), source + '\nreturn { canvas, start, pause, resume, drop, pointerDown, pointerUp, pointerCancel, keyDown, phase, score, best, canDrop, aim, getWorld: () => world };')(...Object.values(args))
  game.canvas.value = fakeCanvas
  mounts.forEach(fn => fn())
  assert.equal(frames.size, 0, 'the ready screen does not run an animation loop')
  game.start()
  assert.equal(frames.size, 1)
  game.drop(); game.drop()
  assert.equal(game.getWorld().fruits.length, 1, 'rapid duplicate drops respect the cooldown')
  function pump(count) {
    for (let i = 0; i < count; i++) {
      clock += 1000 / 60
      for (const [id, callback] of Array.from(frames)) { frames.delete(id); callback(clock) }
    }
  }
  pump(65)
  assert.equal(game.canDrop.value, true)
  const pointer = { pointerId: 1, clientX: 60, button: 0, preventDefault() {} }
  game.pointerDown(pointer); game.pointerCancel(); game.pointerUp(pointer)
  assert.equal(game.getWorld().fruits.length, 1, 'a canceled gesture does not drop')
  game.pointerDown(pointer); game.pointerUp(pointer)
  assert.equal(game.getWorld().fruits.length, 2, 'a released pointer drops exactly once')
  assert.equal(capture.size, 0)
  const previousAim = game.aim.value
  game.keyDown({ key: 'ArrowRight', preventDefault() {} })
  assert.ok(game.aim.value > previousAim, 'keyboard aiming moves the preview')
  game.pause()
  assert.equal(frames.size, 0)
  const pausedTime = game.getWorld().time
  pump(100)
  assert.equal(game.getWorld().time, pausedTime)
  game.resume(); game.resume()
  assert.equal(frames.size, 1, 'resume cannot create duplicate loops')
  document.hidden = true
  listeners.get('visibilitychange')()
  assert.equal(game.phase.value, 'paused', 'switching away pauses the game')
  assert.equal(frames.size, 0)
  document.hidden = false
  game.resume()
  game.getWorld().score = 66
  pump(2)
  assert.equal(game.best.value, 66)
  assert.equal(storage.get('little-arcade-watermelon-best'), '66')
  game.getWorld().over = true
  pump(2)
  assert.equal(game.phase.value, 'over')
  assert.equal(frames.size, 0)
  game.start()
  assert.equal(game.score.value, 0)
  assert.equal(game.getWorld().fruits.length, 0)
  assert.equal(game.best.value, 66, 'restart preserves the best score')
  unmounts.forEach(fn => fn())
  assert.equal(frames.size, 0, 'leaving the game cancels its frame')
  assert.equal(listeners.size, 0, 'leaving the game removes its listeners')
}

test().catch(error => { console.error(error); process.exitCode = 1 })
