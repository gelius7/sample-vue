/* eslint-env es6 */
const assert = require('node:assert/strict')
const fs = require('node:fs')

async function check() {
  const engine = await import('../src/tetris.mjs')
  const { COLUMNS, ROWS, TARGET_LINES, SHAPES, createGame, fits, move, rotate, hardDrop, tick, formatTime } = engine
  const piece = (type, x = 3, y = 0) => ({ type, x, y, cells: SHAPES[type].map(row => [...row]) })
  const game = createGame(() => .5)
  assert.equal(COLUMNS, 10); assert.equal(ROWS, 20); assert.equal(TARGET_LINES, 40)
  assert.equal(Object.keys(SHAPES).length, 7)
  assert.equal(game.board.length, 20)
  assert.ok(game.board.every(row => row.length === 10 && row.every(cell => cell === null)))
  for (const type of Object.keys(SHAPES)) {
    assert.equal(SHAPES[type].flat().filter(Boolean).length, 4, type + ' has four squares')
    game.piece = piece(type, 3, 5)
    const before = JSON.stringify(game.piece.cells)
    for (let i = 0; i < 4; i++) { assert.equal(rotate(game), true); assert.equal(fits(game, game.piece), true) }
    assert.equal(JSON.stringify(game.piece.cells), before, type + ' returns to its original rotation')
  }
  const bagGame = createGame(() => .5), types = []
  for (let i = 0; i < 14; i++) {
    types.push(bagGame.piece.type)
    hardDrop(bagGame)
    bagGame.board.forEach(row => row.fill(null))
  }
  assert.equal(new Set(types.slice(0, 7)).size, 7)
  assert.equal(new Set(types.slice(7)).size, 7, 'each shuffled bag contains all seven pieces')
  game.piece = piece('I', 0)
  assert.equal(move(game, -1), false)
  for (let i = 0; i < 20; i++) move(game, 1)
  assert.equal(game.piece.x, 6, 'piece cannot cross either wall')
  rotate(game)
  game.piece.x = 9
  assert.equal(rotate(game), true, 'wall kick returns a horizontal I inside the right edge')
  assert.equal(game.piece.x, 6)
  game.piece = piece('T', 3, 0)
  game.board[2].fill('O')
  const blocked = JSON.stringify(game.piece)
  assert.equal(rotate(game), false, 'a blocked rotation is rejected without overwriting the stack')
  assert.equal(JSON.stringify(game.piece), blocked)
  assert.equal(fits(game, { ...game.piece, y: -1 }), false, 'pieces cannot rotate outside the visible ceiling')
  const dropGame = createGame()
  dropGame.piece = piece('O', 0)
  assert.equal(move(dropGame, 0, 1), true)
  assert.equal(dropGame.piece.y, 1, 'soft drop moves one row')
  hardDrop(dropGame)
  assert.ok(dropGame.board[18][0] && dropGame.board[19][1], 'hard drop locks at the floor')
  assert.equal(dropGame.board.flat().filter(Boolean).length, 4)

  function clearRows(count, lines = 0) {
    const round = createGame()
    round.lines = lines
    for (let y = ROWS - count; y < ROWS; y++) round.board[y].fill('J')
    if (count === 1) {
      for (let x = 3; x < 7; x++) round.board[19][x] = null
      round.piece = piece('I', 3)
    } else {
      for (let y = ROWS - count; y < ROWS; y++) round.board[y][4] = null
      round.piece = { type: 'I', cells: [[1], [1], [1], [1]], x: 4, y: 0 }
    }
    return round
  }
  for (const count of [1, 2, 3, 4]) {
    const round = clearRows(count)
    hardDrop(round)
    assert.equal(round.lines, count, 'all completed rows clear together')
    assert.equal(round.board.length, ROWS)
    assert.ok(round.board.every(row => row.length === COLUMNS))
    assert.equal(round.board[0].every(cell => cell === null), true)
  }
  const shifted = clearRows(1)
  shifted.board[10][0] = 'T'
  hardDrop(shifted)
  assert.equal(shifted.board[11][0], 'T', 'rows above a cleared line fall exactly one row')
  for (const [lines, count] of [[39, 1], [38, 4]]) {
    const round = clearRows(count, lines)
    tick(round, 123)
    hardDrop(round)
    assert.equal(round.status, 'won', 'reaching or crossing 40 lines wins immediately')
    assert.equal(round.lines, 40)
    assert.equal(round.piece, null)
    assert.equal(round.elapsedMs, 123)
    const ended = JSON.stringify(round)
    tick(round, 10000); move(round, 1); rotate(round); hardDrop(round)
    assert.equal(JSON.stringify(round), ended, 'success freezes the board and final time')
  }
  const topout = createGame()
  topout.piece = piece('O', 0, 18)
  topout.bag = ['T']
  topout.board[0][4] = 'L'
  hardDrop(topout)
  assert.equal(topout.status, 'over', 'a blocked spawn ends a round even without a completely filled board')
  const ended = JSON.stringify(topout)
  hardDrop(topout); tick(topout, 10000)
  assert.equal(JSON.stringify(topout), ended)
  const successBeforeSpawn = clearRows(1, 39)
  successBeforeSpawn.board[0][3] = 'Z'; successBeforeSpawn.board[1][3] = 'Z'
  successBeforeSpawn.bag = ['O']
  successBeforeSpawn.piece.y = 18
  hardDrop(successBeforeSpawn)
  assert.equal(successBeforeSpawn.status, 'won', '40-line completion takes priority over the next spawn')
  const falling = createGame()
  tick(falling, 699); assert.equal(falling.piece.y, 0)
  tick(falling, 1); assert.equal(falling.piece.y, 1, 'gravity advances at the basic interval')
  falling.status = 'paused'
  const paused = JSON.stringify(falling)
  tick(falling, 30000); move(falling, 1); rotate(falling); hardDrop(falling)
  assert.equal(JSON.stringify(falling), paused, 'pause freezes time, gravity, and controls')
  assert.equal(formatTime(61234), '1:01.2')
  assert.equal(formatTime(0), '0:00.0')
  lifecycle(engine, clearRows)
  console.log('Tetris passed: seven pieces/bags, rotations/wall kicks/collisions, soft/hard drop, gravity, 1–4 line clears, 40-line crossings, topout, final time, pause/restart, keyboard/touch controls and route-exit cleanup.')
}
function lifecycle(engine, clearRows) {
  const component = fs.readFileSync('src/components/TetrisGame.vue', 'utf8')
  const source = component.split('<script setup>')[1].split('</script>')[0].replace(/^import .+$/gm, '')
  const mounts = [], unmounts = [], frames = new Map(), listeners = new Map()
  let clock = 0, nextId = 0, focusCount = 0
  const events = { addEventListener: (event, fn) => listeners.set(event, fn), removeEventListener: (event, fn) => { assert.equal(listeners.get(event), fn); listeners.delete(event) } }
  const document = { hidden: false, ...events }
  const args = {
    ...engine, ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }), nextTick: fn => fn(),
    onMounted: fn => mounts.push(fn), onUnmounted: fn => unmounts.push(fn),
    document, window: events, performance: { now: () => clock },
    requestAnimationFrame: fn => { frames.set(++nextId, fn); return nextId }, cancelAnimationFrame: id => frames.delete(id),
  }
  const app = new Function(...Object.keys(args), source + '\nreturn { game, boardElement, phase, displayCells, start, pause, resume, act, keyDown };')(...Object.values(args))
  app.boardElement.value = { focus() { focusCount++ } }
  mounts.forEach(fn => fn())
  assert.equal(app.phase.value, 'ready'); assert.equal(frames.size, 0)
  assert.equal(app.displayCells.value.length, 200)
  app.start(); app.start()
  assert.equal(frames.size, 1, 'repeated start keeps one animation loop')
  function pump(ms) {
    clock += ms
    for (const [id, callback] of Array.from(frames)) { frames.delete(id); callback() }
  }
  pump(125)
  assert.equal(app.game.value.elapsedMs, 125)
  let prevented = 0
  const key = (key, repeat = false, tagName = 'DIV') => app.keyDown({ key, repeat, target: { tagName }, preventDefault() { prevented++ } })
  const startX = app.game.value.piece.x
  key('ArrowLeft'); assert.equal(app.game.value.piece.x, startX - 1)
  key('ArrowRight', true); assert.equal(app.game.value.piece.x, startX, 'held arrows can repeat')
  key('ArrowUp', true); assert.equal(prevented, 3)
  key(' ', true); assert.equal(app.game.value.board.flat().filter(Boolean).length, 0, 'held Space cannot drop many pieces')
  key(' ', false, 'BUTTON'); assert.equal(app.game.value.board.flat().filter(Boolean).length, 0, 'native button Space is not also a hard drop')
  key(' '); assert.equal(app.game.value.board.flat().filter(Boolean).length, 4)
  clock += 75; key('p')
  assert.equal(app.phase.value, 'paused'); assert.equal(frames.size, 0)
  assert.equal(app.game.value.elapsedMs, 200, 'pause includes time since the last frame')
  const snapshot = JSON.stringify(app.game.value)
  pump(5000); key('ArrowLeft'); app.act('drop')
  assert.equal(JSON.stringify(app.game.value), snapshot)
  key('Escape'); app.resume()
  assert.equal(frames.size, 1, 'resume cannot duplicate animation loops')
  pump(300)
  assert.equal(app.game.value.elapsedMs, 500, 'paused wall time is excluded')
  document.hidden = true; listeners.get('visibilitychange')()
  assert.equal(app.phase.value, 'paused'); assert.equal(frames.size, 0)
  document.hidden = false; listeners.get('visibilitychange')()
  assert.equal(app.phase.value, 'paused', 'tab return waits for an explicit resume')
  app.resume(); listeners.get('blur')()
  assert.equal(app.phase.value, 'paused', 'window blur also pauses')
  app.start()
  assert.equal(app.game.value.lines, 0); assert.equal(app.game.value.elapsedMs, 0)
  assert.equal(app.game.value.board.flat().filter(Boolean).length, 0)
  app.game.value = clearRows(1, 39)
  clock += 321
  app.act('drop')
  assert.equal(app.phase.value, 'won'); assert.equal(frames.size, 0)
  assert.equal(app.game.value.elapsedMs, 321, 'winning input captures time before the next frame')
  pump(8000)
  assert.equal(app.game.value.elapsedMs, 321, 'final time stays frozen')
  app.start()
  assert.equal(app.phase.value, 'playing'); assert.equal(app.game.value.lines, 0)
  unmounts.forEach(fn => fn())
  assert.equal(frames.size, 0, 'leaving the route stops animation')
  assert.equal(listeners.size, 0, 'leaving the route removes all global listeners')
  assert.ok(focusCount >= 3, 'start and resume restore keyboard focus')
  for (const action of ['left', 'right', 'rotate', 'down', 'drop']) assert.ok(component.includes(`@click="act('${action}')"`), action + ' has a native touch/keyboard button')
  assert.ok(component.includes(':disabled="phase !== \'playing\'"'))
  assert.ok(component.includes('@media(max-height:960px) and (min-width:601px)'), 'short desktop windows use the compact side layout')
  assert.ok(component.includes('calc((100svh - 240px)/2)'), 'desktop board height follows the available viewport')
}
check().catch(error => { console.error(error); process.exitCode = 1 })
