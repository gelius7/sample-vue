<template>
  <section class="tetris-game" aria-labelledby="tetris-title" @keydown="keyDown">
    <header class="tetris-intro"><span>ONE LINE AT A TIME</span><h1 id="tetris-title">테트리스 <em>40라인</em></h1><p>빈틈없이 차곡차곡. 마흔 줄에 도전해요.</p></header>
    <div class="tetris-shell">
      <div class="tetris-hud">
        <div><span>남은 라인</span><strong data-testid="tetris-remaining">{{ TARGET_LINES - (game?.lines || 0) }}<small> / 40</small></strong></div>
        <div class="tetris-clock"><span>플레이 시간</span><strong data-testid="tetris-time">{{ formatTime(game?.elapsedMs || 0) }}</strong></div>
        <button class="tetris-pause" :disabled="phase !== 'playing'" aria-label="게임 일시정지" @click="pause">Ⅱ</button>
      </div>
      <div class="tetris-board-wrap">
        <div ref="boardElement" class="tetris-board" tabindex="0" role="application" aria-label="테트리스 10칸 20줄. 좌우 화살표로 이동, 위 화살표로 회전, 아래 화살표로 내리기, 스페이스로 바로 놓기. P 또는 Escape로 일시정지.">
          <span v-for="(cell, i) in displayCells" :key="i" class="tetris-cell" :class="cell ? `block-${cell}` : ''" aria-hidden="true"></span>
        </div>
        <div v-if="phase !== 'playing'" class="tetris-overlay">
          <div class="tetris-message" role="status">
            <span class="tetris-symbol" aria-hidden="true">{{ phase === 'won' ? '✦' : phase === 'over' ? '▦' : '▥' }}</span>
            <h2>{{ phase === 'won' ? '40라인 성공!' : phase === 'over' ? '게임 종료' : phase === 'paused' ? '잠깐 쉬어 가요.' : '차곡차곡, 40라인.' }}</h2>
            <template v-if="phase === 'won'"><p>마흔 줄을 모두 지웠어요.</p><strong class="tetris-result" data-testid="tetris-result">{{ formatTime(game.elapsedMs) }}</strong><small>성공 시간 · 일시정지 시간 제외</small></template>
            <p v-else-if="phase === 'over'">블록을 놓을 공간이 없어요.<br>{{ game.lines }}라인을 지웠어요!</p>
            <p v-else-if="phase === 'paused'">블록과 시간도 함께 멈췄어요.</p>
            <p v-else>가로 한 줄을 채우면 사라져요.<br>위까지 쌓이기 전에 40라인을 지워요.</p>
            <button class="tetris-primary" @click="phase === 'paused' ? resume() : start()">{{ phase === 'paused' ? '이어서 하기' : phase === 'ready' ? '게임 시작' : '다시 하기' }} <span>→</span></button>
            <button v-if="phase === 'paused'" class="tetris-restart" @click="start">처음부터 다시 하기</button>
          </div>
        </div>
      </div>
      <div class="tetris-controls" aria-label="블록 조작">
        <button :disabled="phase !== 'playing'" aria-label="왼쪽으로 이동" @click="act('left')"><b>←</b><span>왼쪽</span></button>
        <button :disabled="phase !== 'playing'" aria-label="시계 방향 회전" @click="act('rotate')"><b>↻</b><span>회전</span></button>
        <button :disabled="phase !== 'playing'" aria-label="오른쪽으로 이동" @click="act('right')"><b>→</b><span>오른쪽</span></button>
        <button :disabled="phase !== 'playing'" aria-label="한 칸 내리기" @click="act('down')"><b>↓</b><span>내리기</span></button>
        <button :disabled="phase !== 'playing'" class="tetris-drop" aria-label="바로 놓기" @click="act('drop')"><b>⤓</b><span>바로 놓기</span></button>
      </div>
    </div>
    <p class="tetris-help">← → 이동 · ↑ 회전 · ↓ 내리기 · Space 바로 놓기<br>P / Esc 일시정지 · 화면 버튼으로도 플레이해요</p>
    <p class="tetris-sr-only" aria-live="polite">{{ announcement }}</p>
  </section>
</template>

<script setup>
/* eslint-env browser */
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { COLUMNS, ROWS, TARGET_LINES, createGame, formatTime, hardDrop, move, rotate, tick } from '../tetris.mjs'

const game = ref(null)
const boardElement = ref(null)
const announcement = ref('게임 시작을 눌러 40라인에 도전하세요.')
const phase = computed(() => game.value?.status || 'ready')
const displayCells = computed(() => {
  const cells = game.value ? game.value.board.flat() : Array(COLUMNS * ROWS).fill(null)
  if (game.value?.piece && phase.value !== 'over') {
    const piece = game.value.piece
    piece.cells.forEach((row, dy) => row.forEach((filled, dx) => {
      if (filled) cells[(piece.y + dy) * COLUMNS + piece.x + dx] = piece.type
    }))
  }
  return cells
})
let frame = 0, lastTime = 0
function stopFrame() { cancelAnimationFrame(frame); frame = 0 }
function focusBoard() { nextTick(() => boardElement.value?.focus({ preventScroll: true })) }
function start() {
  stopFrame()
  game.value = createGame()
  lastTime = performance.now()
  announcement.value = '게임 시작. 40라인을 지워 보세요.'
  frame = requestAnimationFrame(update)
  focusBoard()
}
function advance() {
  const now = performance.now()
  const previousLines = game.value.lines
  tick(game.value, now - lastTime)
  lastTime = now
  report(previousLines)
}
function report(previousLines) {
  if (phase.value === 'won') announcement.value = `40라인 성공! 성공 시간 ${formatTime(game.value.elapsedMs)}`
  else if (phase.value === 'over') announcement.value = `게임 종료. ${game.value.lines}라인을 지웠어요.`
  else if (game.value.lines !== previousLines) announcement.value = `${TARGET_LINES - game.value.lines}라인 남았어요.`
  if (phase.value !== 'playing') stopFrame()
}
function update() {
  frame = 0
  if (phase.value !== 'playing') return
  advance()
  if (phase.value === 'playing') frame = requestAnimationFrame(update)
}
function act(action) {
  if (phase.value !== 'playing') return
  advance()
  const previousLines = game.value.lines
  if (action === 'left') move(game.value, -1)
  else if (action === 'right') move(game.value, 1)
  else if (action === 'down') move(game.value, 0, 1)
  else if (action === 'rotate') rotate(game.value)
  else if (action === 'drop') hardDrop(game.value)
  report(previousLines)
}
function pause() {
  if (phase.value !== 'playing') return
  advance()
  if (phase.value !== 'playing') return
  game.value.status = 'paused'
  stopFrame()
  announcement.value = '일시정지. 이어서 하기를 누르면 다시 시작해요.'
}
function resume() {
  if (phase.value !== 'paused') return
  game.value.status = 'playing'
  lastTime = performance.now()
  frame = requestAnimationFrame(update)
  announcement.value = '게임을 이어서 시작해요.'
  focusBoard()
}
function keyDown(event) {
  if (event.key === 'Escape' || event.key.toLowerCase() === 'p') {
    if (event.repeat) return
    event.preventDefault()
    if (phase.value === 'paused') resume()
    else pause()
    return
  }
  if (phase.value !== 'playing') return
  if (event.key === ' ' && event.target?.tagName === 'BUTTON') return
  const action = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down', ArrowUp: 'rotate', ' ': 'drop' }[event.key]
  if (!action) return
  event.preventDefault()
  if (!event.repeat || action === 'left' || action === 'right' || action === 'down') act(action)
}
function visibilityChanged() { if (document.hidden) pause() }
onMounted(() => {
  document.addEventListener('visibilitychange', visibilityChanged)
  window.addEventListener('blur', pause)
})
onUnmounted(() => {
  stopFrame()
  document.removeEventListener('visibilitychange', visibilityChanged)
  window.removeEventListener('blur', pause)
})
</script>

<style scoped>
.tetris-game{max-width:540px;margin:0 auto;padding:18px 20px 28px}.tetris-intro{text-align:center;margin-bottom:18px}.tetris-intro>span{color:#a296b4;font-size:9px;letter-spacing:2.5px;font-weight:900}.tetris-intro h1{font-size:27px;letter-spacing:-1px;margin:9px 0}.tetris-intro em{font-style:normal;color:#9681b1}.tetris-intro p{font-size:11px;color:#8d8274;margin:0}.tetris-shell{padding:15px;background:#fffdf7;border:1px solid #e2d9e9;border-radius:22px;box-shadow:0 6px 0 #ece5e9}.tetris-hud{display:flex;align-items:center;gap:12px;margin:0 0 12px}.tetris-hud>div{display:flex;flex-direction:column;gap:3px}.tetris-hud span{font-size:9px;color:#91829d}.tetris-hud strong{font-size:24px;line-height:1.2;letter-spacing:-.7px;font-variant-numeric:tabular-nums}.tetris-hud small{font-size:12px;color:#aaa0b1;font-weight:700}.tetris-clock{margin-left:auto}.tetris-clock strong{font-size:21px}.tetris-pause{width:44px;height:44px;border-radius:14px;border:1px solid #e3d9eb;background:#f0e9f5;font-weight:900}.tetris-pause:disabled{opacity:.4;cursor:default}.tetris-board-wrap{position:relative;width:min(100%,280px);margin:auto}.tetris-board{display:grid;grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(20,1fr);aspect-ratio:1/2;background:#ebe7ee;border:3px solid #d7ccdf;border-radius:5px;overflow:hidden;outline-offset:3px}.tetris-cell{min-width:0;min-height:0;border:1px solid #dfd9e4}.tetris-cell[class*="block-"]{border:2px solid #ffffff66;box-shadow:inset 0 -3px 0 #00000013;border-radius:3px}.block-I{background:#7fbac4}.block-O{background:#e9c577}.block-T{background:#b49dcc}.block-S{background:#99b78b}.block-Z{background:#db958d}.block-J{background:#8b9fc4}.block-L{background:#e5ad7f}.tetris-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#fbf7edb8;backdrop-filter:blur(3px);padding:12px}.tetris-message{text-align:center;width:100%;padding:22px 10px;background:#fffdf7f5;border:1px solid #e6dfe9;border-radius:17px;box-shadow:0 8px 22px #443c3310}.tetris-symbol{font-size:36px;color:#b3a1c8}.tetris-message h2{font-size:19px;letter-spacing:-.8px;margin:12px 0}.tetris-message p{font-size:11px;line-height:1.9;color:#8b7c92;margin:10px 0}.tetris-result{display:block;font-size:35px;color:#9175ab;font-variant-numeric:tabular-nums;margin:8px 0}.tetris-message>small{font-size:9px;color:#938499;display:block}.tetris-primary{display:flex;justify-content:space-between;align-items:center;width:100%;padding:13px 15px;margin-top:19px;border:1px solid #a594bc;border-radius:12px;background:#b6a3ce;color:#fff;font-size:12px;font-weight:800;min-height:46px}.tetris-restart{border:0;background:transparent;font-size:10px;color:#8b7b96;min-height:44px;margin-top:5px}.tetris-controls{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:14px}.tetris-controls button{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:3px;min-height:55px;padding:5px 1px;background:#f4eee2;border:1px solid #e3d9c7;border-radius:12px;user-select:none}.tetris-controls b{font-size:22px;line-height:1}.tetris-controls span{font-size:9px;font-weight:700}.tetris-controls .tetris-drop{background:#e9e1f0;border-color:#d7c9e2}.tetris-controls button:active:not(:disabled){transform:translateY(2px);background:#ddd0eb}.tetris-controls button:disabled{opacity:.4;cursor:default}.tetris-help{text-align:center;font-size:10px;color:#9a8c9e;line-height:1.9;margin:16px 0 0}.tetris-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:600px){.tetris-game{padding:10px 14px 20px;max-width:400px}.tetris-intro{margin-bottom:12px}.tetris-intro>span{font-size:8px}.tetris-intro h1{font-size:22px;margin:6px 0}.tetris-intro p{font-size:10px}.tetris-shell{padding:12px}.tetris-board-wrap{width:min(100%,calc((100svh - 320px)/2));min-width:170px}.tetris-help{font-size:9px;margin-top:11px}.tetris-controls{gap:5px;margin-top:10px}.tetris-controls button{min-height:52px}}@media(max-height:960px) and (min-width:601px){.tetris-intro{margin-bottom:12px}.tetris-intro>span,.tetris-intro p{display:none}.tetris-intro h1{font-size:22px;margin:5px 0}.tetris-game{padding-top:5px}.tetris-shell{display:grid;grid-template-columns:1fr minmax(150px,220px) 1fr;align-items:center;gap:15px;max-width:490px}.tetris-hud{flex-direction:column}.tetris-clock{margin-left:0}.tetris-board-wrap{width:min(100%,calc((100svh - 240px)/2));grid-column:2;grid-row:1}.tetris-controls{grid-template-columns:1fr 1fr;margin:0}.tetris-controls .tetris-drop{grid-column:span 2}.tetris-message{padding:10px 5px}.tetris-message h2{font-size:14px}.tetris-message p{font-size:9px}.tetris-symbol{font-size:24px}.tetris-primary{font-size:10px;padding:8px}.tetris-help{margin-top:10px}}
</style>
