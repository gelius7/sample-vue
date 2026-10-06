/* eslint-env es6 */
const assert = require('node:assert/strict')
const fs = require('node:fs')
;(async () => {
  const rules = await import('../src/snake.mjs')
  const { SIZE, createGame, placeFood, turn, tick } = rules
  let game = createGame(() => 0)
  assert.equal(game.snake.length, 3)
  assert.deepEqual(game.food, { x: 0, y: 0 })
  turn(game, 'left'); assert.equal(game.queued, null)
  turn(game, 'up'); turn(game, 'left'); assert.equal(game.queued, 'up')
  tick(game); assert.deepEqual(game.snake[0], { x: 7, y: 7 })
  turn(game, 'left'); tick(game); assert.deepEqual(game.snake[0], { x: 6, y: 7 })
  game.food = { x: 5, y: 7 }; tick(game, () => 0)
  assert.equal(game.score, 10); assert.equal(game.snake.length, 4)
  assert.ok(!game.snake.some(cell => cell.x === game.food.x && cell.y === game.food.y))
  for (const [head, direction] of [[{x:0,y:3},'left'], [{x:15,y:3},'right'], [{x:3,y:0},'up'], [{x:3,y:15},'down']]) {
    game = createGame(); game.snake = [head]; game.direction = direction; tick(game); assert.equal(game.status, 'over')
  }
  game = createGame(); game.snake = [{x:2,y:2},{x:2,y:3},{x:3,y:3},{x:3,y:2},{x:4,y:2}]; tick(game)
  assert.equal(game.status, 'over', 'collision with body ends the game')
  game = createGame(); game.snake = [{x:2,y:2},{x:2,y:3},{x:3,y:3},{x:3,y:2}]; tick(game)
  assert.equal(game.status, 'playing', 'moving into a departing tail is legal')
  game = createGame(); game.status = 'paused'; const paused = JSON.stringify(game); turn(game,'up'); tick(game); assert.equal(JSON.stringify(game), paused)
  const full = []
  for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++) full.push({x,y})
  assert.equal(placeFood(full), null)
  const almostFull = full.filter(c => c.x !== 0 || c.y !== 0)
  assert.deepEqual(placeFood(almostFull, () => .99999), {x:0,y:0})
  game = createGame(); game.snake = [{x:1,y:0}, ...almostFull.filter(c => c.x !== 1 || c.y !== 0)]; game.direction = 'left'; game.food={x:0,y:0}; tick(game)
  assert.equal(game.status,'won'); assert.equal(game.snake.length,SIZE*SIZE); assert.equal(game.food,null)
  const won=JSON.stringify(game); tick(game); assert.equal(JSON.stringify(game),won)

  const source = fs.readFileSync('src/components/SnakeGame.vue','utf8').split('<script setup>')[1].split('</script>')[0].replace(/^import .+$/gm,'')
  const mounts=[],unmounts=[],intervals=new Map(),listeners=new Map(); let id=0, focus=0
  const document={hidden:false,addEventListener:(e,f)=>listeners.set(e,f),removeEventListener:(e,f)=>{assert.equal(listeners.get(e),f);listeners.delete(e)}}
  const window={addEventListener:document.addEventListener,removeEventListener:document.removeEventListener}
  const args={...rules,ref:value=>({value}),computed:fn=>({get value(){return fn()}}),nextTick:fn=>fn(),onMounted:fn=>mounts.push(fn),onUnmounted:fn=>unmounts.push(fn),document,window,setInterval:fn=>{intervals.set(++id,fn);return id},clearInterval:id=>intervals.delete(id)}
  const app=new Function(...Object.keys(args),source+'\nreturn { game, boardElement, phase, cells, start, pause, resume, act, keyDown, swipeStart, swipeEnd };')(...Object.values(args))
  app.boardElement.value={focus:()=>focus++}; mounts.forEach(fn=>fn())
  assert.equal(app.phase.value,'ready'); assert.equal(app.cells.value.length,SIZE*SIZE)
  app.start(); app.start(); assert.equal(intervals.size,1,'restarts cannot duplicate timers')
  app.game.value.food={x:8,y:8}; [...intervals.values()][0](); assert.equal(app.game.value.score,10)
  let prevented=0
  const key=(key,repeat=false)=>app.keyDown({key,repeat,preventDefault:()=>prevented++})
  key('W'); key('a'); assert.equal(app.game.value.queued,'up'); [...intervals.values()][0]()
  key('a',true); assert.equal(app.game.value.queued,null,'held keyboard repeats ignored')
  key('p'); assert.equal(app.phase.value,'paused'); assert.equal(intervals.size,0)
  const frozen=JSON.stringify(app.game.value); app.act('left'); assert.equal(JSON.stringify(app.game.value),frozen)
  key('p',true); assert.equal(app.phase.value,'paused')
  key('Escape'); assert.equal(app.phase.value,'playing'); assert.equal(intervals.size,1)
  app.pause(); app.resume(); app.resume(); assert.equal(intervals.size,1)
  document.hidden=true; listeners.get('visibilitychange')(); assert.equal(app.phase.value,'paused'); assert.equal(intervals.size,0)
  document.hidden=false; listeners.get('visibilitychange')(); assert.equal(app.phase.value,'paused','tab return never auto-resumes')
  app.resume(); listeners.get('blur')(); assert.equal(app.phase.value,'paused')
  app.start(); let captured
  app.swipeStart({isPrimary:true,pointerId:7,clientX:30,clientY:30,currentTarget:{setPointerCapture:id=>captured=id}})
  app.swipeEnd({pointerId:8,clientX:30,clientY:0}); assert.equal(app.game.value.queued,null)
  app.swipeEnd({pointerId:7,clientX:30,clientY:0}); assert.equal(app.game.value.queued,'up'); assert.equal(captured,7)
  app.start(); app.game.value.snake=[{x:15,y:8}]; [...intervals.values()][0](); assert.equal(app.phase.value,'over'); assert.equal(intervals.size,0)
  app.start(); assert.equal(app.game.value.score,0); assert.equal(app.game.value.snake.length,3)
  assert.ok(focus>0); assert.ok(prevented>0)
  unmounts.forEach(fn=>fn()); assert.equal(intervals.size,0); assert.equal(listeners.size,0)
  assert.match(fs.readFileSync('src/games.js','utf8'),/id: 'snake'/)
  console.log('Snake passed: growth, food, four walls, self/tail collision, reverse/rapid input, full board, keyboard/swipes, pause/resume, restart, backgrounding, and cleanup.')
})().catch(error=>{console.error(error);process.exitCode=1})
