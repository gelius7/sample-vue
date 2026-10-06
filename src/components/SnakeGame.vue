<template>
  <section class="snake-game" aria-labelledby="snake-title" @keydown="keyDown">
    <header class="snake-intro"><span>JUST ONE MORE BITE</span><h1 id="snake-title">꼬물꼬물 <em>스네이크</em></h1><p>사과 한 입, 한 칸 더 길게.</p></header>
    <div class="snake-shell">
      <div class="snake-hud"><div><span>점수</span><strong data-testid="snake-score">{{ game?.score || 0 }}<small> 점</small></strong></div><p>벽과 내 꼬리를 조심해요</p><button :disabled="phase !== 'playing'" aria-label="게임 일시정지" @click="pause">Ⅱ</button></div>
      <div class="snake-board-wrap">
        <div ref="boardElement" class="snake-board" tabindex="0" role="application" aria-label="스네이크 16칸 정사각형. 화살표 또는 WASD로 이동, P 또는 Escape로 일시정지." @pointerdown="swipeStart" @pointerup="swipeEnd" @pointercancel="swipe = null">
          <span v-for="(cell, i) in cells" :key="i" class="snake-cell" :class="cell" aria-hidden="true"><span v-if="cell === 'food'">●</span><span v-if="cell === 'head'">··</span></span>
        </div>
        <div v-if="phase !== 'playing'" class="snake-overlay">
          <div class="snake-message" role="status">
            <span class="snake-symbol" aria-hidden="true">{{ phase === 'won' ? '✦' : '〰' }}</span>
            <h2>{{ phase === 'won' ? '온 세상이 내 꼬리!' : phase === 'over' ? '앗, 부딪혔어요!' : phase === 'paused' ? '잠깐 쉬어 가요.' : '한 입씩, 꼬물꼬물.' }}</h2>
            <p v-if="phase === 'over' || phase === 'won'">{{ game.score }}점 · 사과 {{ game.score / 10 }}개</p>
            <p v-else-if="phase === 'paused'">이어서 하면 멈춘 자리에서 출발해요.</p>
            <p v-else>사과를 먹으면 몸이 길어져요.<br>벽과 몸에 닿지 않게 방향을 바꿔요.</p>
            <button class="snake-primary" @click="phase === 'paused' ? resume() : start()">{{ phase === 'paused' ? '이어서 하기' : phase === 'ready' ? '게임 시작' : '다시 하기' }} <span>→</span></button>
            <button v-if="phase === 'paused'" class="snake-restart" @click="start">처음부터 다시 하기</button>
          </div>
        </div>
      </div>
      <div class="snake-controls" aria-label="스네이크 방향 조작">
        <button class="up" :disabled="phase !== 'playing'" aria-label="위로 이동" @click="act('up')">↑</button>
        <button class="left" :disabled="phase !== 'playing'" aria-label="왼쪽으로 이동" @click="act('left')">←</button>
        <button class="down" :disabled="phase !== 'playing'" aria-label="아래로 이동" @click="act('down')">↓</button>
        <button class="right" :disabled="phase !== 'playing'" aria-label="오른쪽으로 이동" @click="act('right')">→</button>
      </div>
    </div>
    <p class="snake-help">방향키 / WASD · 화면 버튼 또는 보드 쓸어넘기기<br>P / Esc 일시정지 · 반대 방향으로는 바로 돌 수 없어요</p>
  </section>
</template>

<script setup>
/* eslint-env browser */
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { SIZE, createGame, tick, turn } from '../snake.mjs'
const game = ref(null), boardElement = ref(null)
const phase = computed(() => game.value?.status || 'ready')
const cells = computed(() => {
  const result = Array(SIZE * SIZE).fill('')
  if (!game.value) return result
  game.value.snake.forEach((cell, i) => { result[cell.y * SIZE + cell.x] = i ? 'body' : 'head' })
  const food = game.value.food
  if (food) result[food.y * SIZE + food.x] = 'food'
  return result
})
let timer = 0, swipe = null
function stop() { clearInterval(timer); timer = 0; swipe = null }
function run() {
  stop()
  timer = setInterval(() => { tick(game.value); if (phase.value !== 'playing') stop() }, 160)
  nextTick(() => boardElement.value?.focus({ preventScroll: true }))
}
function start() { game.value = createGame(); run() }
function pause() { if (phase.value === 'playing') { game.value.status = 'paused'; stop() } }
function resume() { if (phase.value === 'paused') { game.value.status = 'playing'; run() } }
function act(direction) { if (game.value) turn(game.value, direction) }
function keyDown(event) {
  const key = event.key.toLowerCase()
  if (key === 'p' || key === 'escape') {
    event.preventDefault()
    if (!event.repeat) { if (phase.value === 'paused') resume(); else pause() }
    return
  }
  const direction = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' }[key]
  if (direction && phase.value === 'playing') { event.preventDefault(); if (!event.repeat) act(direction) }
}
function swipeStart(event) {
  if (phase.value !== 'playing' || !event.isPrimary) return
  swipe = { x: event.clientX, y: event.clientY, id: event.pointerId }
  event.currentTarget.setPointerCapture(event.pointerId)
}
function swipeEnd(event) {
  if (!swipe || swipe.id !== event.pointerId) return
  const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y
  swipe = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return
  act(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'right' : 'left' : dy > 0 ? 'down' : 'up')
}
function visibilityChanged() { if (document.hidden) pause() }
onMounted(() => { document.addEventListener('visibilitychange', visibilityChanged); window.addEventListener('blur', pause) })
onUnmounted(() => { stop(); document.removeEventListener('visibilitychange', visibilityChanged); window.removeEventListener('blur', pause) })
</script>

<style scoped>
.snake-game{max-width:500px;margin:auto;padding:12px 18px 24px}.snake-intro{text-align:center;margin-bottom:16px}.snake-intro>span{font-size:9px;font-weight:900;letter-spacing:2px;color:#5c7155}.snake-intro h1{font-size:27px;letter-spacing:-1px;margin:8px 0}.snake-intro em{font-style:normal;color:#58764e}.snake-intro p{font-size:11px;color:#74695d;margin:0}.snake-shell{background:#fffdf7;border:1px solid #dce2cf;border-radius:22px;padding:15px;box-shadow:0 6px 0 #e9eadc}.snake-hud{display:flex;align-items:center;gap:12px;margin-bottom:12px}.snake-hud>div{display:flex;flex-direction:column}.snake-hud span{font-size:10px;color:#5c7155}.snake-hud strong{font-size:25px;font-variant-numeric:tabular-nums}.snake-hud small{font-size:11px;color:#69735e}.snake-hud p{font-size:10px;color:#66715a;margin-left:auto}.snake-hud button{width:44px;height:44px;border:1px solid #d7dfc9;border-radius:13px;background:#edf1e5;font-weight:900}.snake-board-wrap{position:relative;width:min(100%,380px);margin:auto}.snake-board{display:grid;grid-template-columns:repeat(16,1fr);grid-template-rows:repeat(16,1fr);aspect-ratio:1;background:#eef1df;border:3px solid #c6d3ac;border-radius:7px;overflow:hidden;touch-action:none;user-select:none}.snake-cell{min-width:0;min-height:0;border:1px solid #dce4ca55;display:flex;align-items:center;justify-content:center}.snake-cell.body{background:#95b67b;border:1px solid #edf1df;border-radius:5px}.snake-cell.head{background:#577b49;color:white;font-size:20px;line-height:1;font-weight:900;border-radius:5px}.snake-cell.head span{transform:translateY(-4px)}.snake-cell.food{color:#cf7059;font-size:24px;line-height:1}.snake-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:14px;background:#fbf7edb8;backdrop-filter:blur(3px)}.snake-message{text-align:center;width:100%;max-width:280px;border:1px solid #dce2cf;border-radius:18px;background:#fffdf7f5;padding:18px}.snake-symbol{color:#8cab77;font-size:37px;font-weight:900;line-height:1}.snake-message h2{font-size:20px;letter-spacing:-.7px;margin:10px 0}.snake-message p{font-size:11px;line-height:1.8;color:#65725c;margin:8px 0}.snake-primary{display:flex;justify-content:space-between;width:100%;min-height:46px;align-items:center;padding:10px 16px;border:1px solid #71975b;border-radius:12px;background:#587847;color:white;font-size:12px;font-weight:800;margin-top:17px}.snake-restart{background:none;border:0;font-size:10px;color:#61734f;min-height:44px;margin-top:3px}.snake-controls{display:grid;grid-template-columns:repeat(3,56px);grid-template-rows:repeat(2,46px);justify-content:center;gap:5px;margin-top:14px}.snake-controls button{border:1px solid #d8ddc9;border-radius:12px;background:#eef1e3;font-size:24px;font-weight:900;user-select:none}.snake-controls .up{grid-column:2}.snake-controls .left{grid-column:1;grid-row:2}.snake-controls .down{grid-column:2;grid-row:2}.snake-controls .right{grid-column:3;grid-row:2}.snake-controls button:active:not(:disabled){background:#cfddb9;transform:translateY(2px)}button:disabled{opacity:.4;cursor:default}.snake-help{text-align:center;font-size:10px;line-height:1.9;color:#696d55;margin:15px 0 0}@media(max-width:600px){.snake-game{padding:6px 14px 15px}.snake-intro{margin-bottom:10px}.snake-intro>span{font-size:8px}.snake-intro h1{font-size:23px;margin:5px 0}.snake-intro p{display:none}.snake-shell{padding:12px}.snake-board-wrap{width:min(100%,max(220px,calc(100svh - 330px)))}.snake-controls{margin-top:10px}.snake-help{font-size:9px;margin-top:10px}.snake-message{padding:12px}.snake-message h2{font-size:18px}.snake-primary{margin-top:12px}}@media(max-height:550px) and (min-width:601px){.snake-intro>span,.snake-intro p{display:none}.snake-intro h1{font-size:21px;margin:0}.snake-shell{display:grid;grid-template-columns:1fr 250px;gap:10px}.snake-hud{grid-column:1;flex-wrap:wrap;margin:0}.snake-hud p{display:none}.snake-board-wrap{grid-column:2;grid-row:1/3;width:min(100%,calc(100svh - 170px))}.snake-controls{grid-column:1;grid-row:2;grid-template-columns:repeat(3,44px)}.snake-help{margin-top:8px}}
</style>
