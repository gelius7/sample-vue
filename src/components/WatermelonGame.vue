<template>
  <section class="watermelon-game" aria-labelledby="fruit-title">
    <header class="fruit-intro">
      <span class="fruit-eyebrow">A LITTLE DROP OF HAPPINESS</span>
      <h1 id="fruit-title">작은 과일, <span>커다란 행복.</span></h1>
      <p>같은 과일이 만나면 쑥! 나만의 수박을 만들어 봐요.</p>
    </header>

    <div class="fruit-layout">
      <section class="fruit-board" aria-label="수박 만들기 게임">
        <div class="fruit-board-top">
          <span class="fruit-room"><i></i> 차곡차곡 과일 바구니</span>
          <button v-if="phase === 'playing'" class="fruit-pause" aria-label="게임 잠깐 쉬기" @click="pause">Ⅱ</button>
          <span v-else class="fruit-room-decoration" aria-hidden="true">✦</span>
        </div>
        <div class="fruit-hud">
          <div><span>나의 점수</span><strong data-testid="fruit-score">{{ score.toLocaleString() }}<small>pt</small></strong></div>
          <div class="fruit-next"><span>다음 과일</span><div><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="27" r="17" :fill="FRUITS[next].color" :stroke="FRUITS[next].shade" stroke-width="1.5"/><path d="M24 11q-1-9 9-8q1 9-9 8" fill="#7e9e70"/><circle cx="19" cy="27" r="1.5" fill="#514538"/><circle cx="29" cy="27" r="1.5" fill="#514538"/><path d="M22 32q2 2 4 0" fill="none" stroke="#514538" stroke-width="1.3" stroke-linecap="round"/></svg><strong>{{ FRUITS[next].name }}</strong></div></div>
        </div>

        <div class="fruit-jar" :class="{ 'fruit-in-danger': danger }">
          <canvas ref="canvas" :width="WIDTH" :height="HEIGHT" tabindex="0" role="application"
            aria-label="과일 바구니. 왼쪽과 오른쪽 화살표로 위치를 정하고 스페이스 또는 엔터로 떨어뜨리세요. 터치는 끌어서 놓으세요."
            @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerCancel" @lostpointercapture="pointerCancel" @keydown="keyDown"
          >같은 과일 두 개를 합쳐 수박을 만드는 게임입니다. 아래 위치 조절과 떨어뜨리기 버튼으로도 플레이할 수 있어요.</canvas>
          <span class="fruit-rim-label" :class="{ 'fruit-rim-warning': danger }">{{ danger ? '앗, 바구니가 가득해요!' : '이 선을 넘지 않게 조심!' }}</span>
          <div v-if="phase !== 'playing'" class="fruit-overlay">
            <div class="fruit-overlay-card">
              <svg class="fruit-mascot" viewBox="0 0 100 96" aria-hidden="true"><circle cx="50" cy="50" r="38" fill="#8db997" stroke="#5e8d68" stroke-width="2"/><path d="M32 17q-17 32 0 66m36-66q17 32 0 66M48 13q-8 39 0 75" fill="none" stroke="#63936c" stroke-width="6"/><circle cx="37" cy="48" r="3" fill="#3f5842"/><circle cx="63" cy="48" r="3" fill="#3f5842"/><ellipse cx="28" cy="57" rx="7" ry="4" fill="#e9ad9d"/><ellipse cx="72" cy="57" rx="7" ry="4" fill="#e9ad9d"/><path d="M43 58q7 8 14 0" fill="none" stroke="#3f5842" stroke-width="2.5" stroke-linecap="round"/><path d="M51 12q-3-10 8-8" fill="none" stroke="#5e8d68" stroke-width="3" stroke-linecap="round"/></svg>
              <span class="fruit-eyebrow">{{ phase === 'over' ? 'ONE SWEET LITTLE ROUND' : phase === 'paused' ? 'TAKE YOUR TIME' : 'HELLO, WATERMELON!' }}</span>
              <h2>{{ phase === 'over' ? '달콤한 한 판이었어요!' : phase === 'paused' ? '잠깐 쉬어 가요.' : '오늘은 수박이 될 거야.' }}</h2>
              <p>{{ phase === 'over' ? `${score.toLocaleString()}점 · 가장 큰 과일은 ${FRUITS[largest].name}!` : phase === 'paused' ? '과일들은 여기서 기다리고 있어요.' : '끌어서 위치를 정하고, 손을 떼면 톡!' }}</p>
              <button class="fruit-primary" @click="phase === 'paused' ? resume() : start()">{{ phase === 'paused' ? '이어서 하기' : phase === 'over' ? '한 번 더 만들기' : '과일 떨어뜨리기' }}<span>→</span></button>
              <button v-if="phase === 'paused'" class="fruit-text-button" @click="start">처음부터 다시 하기</button>
            </div>
          </div>
        </div>
        <div class="fruit-controls">
          <label class="fruit-aim-label" for="fruit-aim">떨어뜨릴 위치 <span>← 왼쪽 · 오른쪽 →</span></label>
          <input id="fruit-aim" v-model.number="aim" type="range" :min="aimMin" :max="WIDTH - aimMin" step="2" :disabled="phase !== 'playing'" aria-label="과일 떨어뜨릴 위치" @input="draw" />
          <button class="fruit-drop" :disabled="phase !== 'playing' || !canDrop" @click="drop">{{ canDrop ? '톡, 떨어뜨리기' : '다음 과일 준비 중…' }}<span aria-hidden="true">↓</span></button>
          <p>터치는 끌어서 놓기 <span>·</span> 키보드는 ← → + Space</p>
        </div>
      </section>

      <aside class="fruit-notebook">
        <div class="fruit-notebook-heading"><span class="fruit-eyebrow">YOUR SWEET LITTLE GOAL</span><span aria-hidden="true">✺</span></div>
        <h2>수박까지 한 걸음.</h2>
        <p class="fruit-description">작은 체리부터 동그란 수박까지.<br>서두르지 말고, 차곡차곡 쌓아 봐요.</p>
        <div class="fruit-best"><span>♕ 최고 기록</span><strong data-testid="fruit-best">{{ best.toLocaleString() }}<small>pt</small></strong></div>
        <div class="fruit-evolution-heading"><strong>과일의 작은 성장 일기</strong><span>{{ largest + 1 }} / {{ FRUITS.length }}</span></div>
        <ol class="fruit-evolution" aria-label="과일 성장 순서">
          <li v-for="(fruit, index) in FRUITS" :key="fruit.name" :class="{ 'fruit-discovered': index <= largest, 'fruit-current-goal': index === largest + 1 }">
            <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="27" r="17" :fill="fruit.color" :stroke="fruit.shade" stroke-width="1.5"/><path v-if="index === 10" d="M17 12q-8 15 0 30m14-30q8 15 0 30m-7-31v32" fill="none" stroke="#52815d" stroke-width="3"/><path d="M24 11q-1-9 9-8q1 9-9 8" fill="#7e9e70"/><circle cx="19" cy="27" r="1.5" fill="#514538"/><circle cx="29" cy="27" r="1.5" fill="#514538"/><path d="M22 32q2 2 4 0" fill="none" stroke="#514538" stroke-width="1.3" stroke-linecap="round"/></svg>
            <span>{{ fruit.name }}</span>
          </li>
        </ol>
        <div class="fruit-how"><span>HOW TO PLAY</span><p><b>01</b> 원하는 위치에서 과일을 톡 떨어뜨려요.</p><p><b>02</b> 같은 과일 두 개가 닿으면 더 크게 자라요.</p><p><b>03</b> 점선 위까지 쌓이지 않게 조심해요.</p></div>
        <div class="fruit-kind-note"><span aria-hidden="true">♡</span><p>조금 삐뚤게 쌓여도 괜찮아요.<br><strong>뜻밖의 만남이 더 달콤할지도!</strong></p></div>
      </aside>
    </div>
    <p class="fruit-sr-only" aria-live="polite">{{ announcement }}</p>
  </section>
</template>

<script setup>
/* eslint-env browser */
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { DANGER_Y, DROP_Y, FRUITS, HEIGHT, STEP, WIDTH, createWorld, dropFruit, stepWorld } from '../fruit.mjs'

const canvas = ref(null)
const phase = ref('ready')
const aim = ref(WIDTH / 2)
const current = ref(0)
const next = ref(1)
const score = ref(0)
const best = ref(0)
const largest = ref(0)
const danger = ref(false)
const canDrop = ref(true)
const announcement = ref('과일 떨어뜨리기를 눌러 시작하세요.')
const aimMin = computed(() => FRUITS[current.value].radius + 6)
let world = createWorld()
let context, frame = 0, lastTime = 0, accumulator = 0, readyAt = 0, activePointer = null
let bursts = []
let reducedMotion = false

function randomFruit() { return [0, 0, 1, 1, 2, 2, 3, 4][Math.floor(Math.random() * 8)] }
function clampAim() { aim.value = Math.max(aimMin.value, Math.min(WIDTH - aimMin.value, aim.value)) }
function persistBest() {
  if (score.value <= best.value) return
  best.value = score.value
  try { localStorage.setItem('little-arcade-watermelon-best', String(best.value)) } catch { /* Storage is optional. */ }
}
function start() {
  stopFrame()
  world = createWorld()
  score.value = 0
  largest.value = 0
  current.value = 0
  next.value = randomFruit()
  aim.value = WIDTH / 2
  danger.value = false
  canDrop.value = true
  readyAt = 0
  bursts = []
  phase.value = 'playing'
  announcement.value = '게임 시작. 과일을 끌어서 놓거나 화살표와 스페이스로 떨어뜨리세요.'
  runFrame()
  nextTick(() => canvas.value?.focus({ preventScroll: true }))
}
function stopFrame() {
  cancelAnimationFrame(frame)
  frame = 0
  lastTime = 0
  accumulator = 0
  activePointer = null
}
function pause() {
  if (phase.value !== 'playing') return
  phase.value = 'paused'
  stopFrame()
  announcement.value = '게임을 잠깐 멈췄어요. 이어서 하기를 눌러 다시 시작하세요.'
}
function resume() {
  if (phase.value !== 'paused') return
  phase.value = 'playing'
  runFrame()
  nextTick(() => canvas.value?.focus({ preventScroll: true }))
}
function visibilityChanged() { if (document.hidden) pause() }
function drop() {
  if (phase.value !== 'playing' || !canDrop.value) return
  clampAim()
  dropFruit(world, current.value, aim.value)
  current.value = next.value
  next.value = randomFruit()
  clampAim()
  readyAt = world.time + 0.5
  canDrop.value = false
  draw()
}
function setAim(event) {
  const bounds = canvas.value.getBoundingClientRect()
  aim.value = (event.clientX - bounds.left) / bounds.width * WIDTH
  clampAim()
  if (phase.value !== 'playing') draw()
}
function pointerDown(event) {
  if (phase.value !== 'playing' || activePointer !== null || event.button !== 0) return
  event.preventDefault()
  activePointer = event.pointerId
  canvas.value.setPointerCapture(event.pointerId)
  canvas.value.focus({ preventScroll: true })
  setAim(event)
}
function pointerMove(event) {
  if (phase.value !== 'playing') return
  if (activePointer === event.pointerId || (activePointer === null && event.pointerType === 'mouse')) setAim(event)
}
function pointerUp(event) {
  if (activePointer !== event.pointerId) return
  setAim(event)
  activePointer = null
  if (canvas.value.hasPointerCapture(event.pointerId)) canvas.value.releasePointerCapture(event.pointerId)
  drop()
}
function pointerCancel() { activePointer = null }
function keyDown(event) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    aim.value += event.key === 'ArrowLeft' ? -12 : 12
    clampAim()
    draw()
  } else if (event.code === 'Space' || event.key === 'Enter') {
    event.preventDefault()
    if (!event.repeat) drop()
  } else if (event.key === 'Escape') pause()
}
function runFrame() {
  if (frame || phase.value !== 'playing') return
  frame = requestAnimationFrame(tick)
}
function tick(time) {
  frame = 0
  if (phase.value !== 'playing') return
  accumulator += lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0
  lastTime = time
  while (accumulator >= STEP) {
    const merges = stepWorld(world)
    if (!reducedMotion) bursts.push(...merges.map(merge => ({ ...merge, born: world.time })))
    accumulator -= STEP
    if (world.over) break
  }
  bursts = bursts.filter(burst => world.time - burst.born < 0.55)
  score.value = world.score
  if (world.largest > largest.value) {
    largest.value = world.largest
    announcement.value = `${FRUITS[largest.value].name}을 만들었어요! ${score.value}점.`
  }
  persistBest()
  canDrop.value = world.time >= readyAt
  danger.value = world.fruits.some(fruit => fruit.overflow > 0.1)
  draw()
  if (world.over) {
    phase.value = 'over'
    stopFrame()
    announcement.value = `바구니가 가득 찼어요! 최종 ${score.value}점. 한 번 더 만들기로 다시 시작할 수 있어요.`
  } else runFrame()
}

function circle(x, y, radius, fill) {
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fillStyle = fill
  context.fill()
}
function drawFruit(x, y, level, radius = FRUITS[level].radius, opacity = 1) {
  const fruit = FRUITS[level]
  const c = context
  c.save()
  c.globalAlpha = opacity
  c.translate(x, y)
  c.scale(radius, radius)
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.shadowColor = '#71594120'
  c.shadowBlur = 3
  c.shadowOffsetY = 2
  circle(0, 0, 0.97, fruit.color)
  c.shadowColor = 'transparent'
  c.beginPath()
  c.arc(0, 0, 0.97, 0, Math.PI * 2)
  c.lineWidth = 0.035
  c.strokeStyle = fruit.shade
  c.stroke()
  c.save()
  c.clip()
  if (level === 10) {
    c.strokeStyle = '#4f855f'
    c.lineWidth = 0.13
    for (const offset of [-0.7, -0.24, 0.24, 0.7]) {
      c.beginPath()
      c.moveTo(offset * 0.7, -1)
      c.bezierCurveTo(offset * 1.7, -0.3, offset * 1.7, 0.3, offset * 0.7, 1)
      c.stroke()
    }
  } else if (level === 8 || level === 9) {
    c.strokeStyle = level === 8 ? '#b89e5866' : '#eef5d999'
    c.lineWidth = 0.025
    for (let offset = -2; offset < 2; offset += 0.35) {
      c.beginPath()
      c.moveTo(offset, -1)
      c.lineTo(offset + 1.2, 1)
      c.moveTo(offset, -1)
      c.lineTo(offset - 1.2, 1)
      c.stroke()
    }
  } else if (level === 1 || level === 4) {
    for (const [sx, sy] of [[-0.55, -0.35], [0, -0.55], [0.55, -0.35], [-0.6, 0.3], [0.55, 0.5], [-0.15, 0.67]]) {
      c.beginPath()
      c.ellipse(sx, sy, 0.035, level === 1 ? 0.075 : 0.035, 0.2, 0, Math.PI * 2)
      c.fillStyle = level === 1 ? '#ffe9b3' : '#d7834488'
      c.fill()
    }
  } else if (level === 2) {
    for (const [sx, sy] of [[-0.38, -0.3], [0.35, -0.38], [-0.45, 0.37], [0.35, 0.4]]) {
      circle(sx, sy, 0.33, '#bea8d6')
      circle(sx - 0.06, sy - 0.09, 0.08, '#dbcbea99')
    }
  } else if (level === 7) {
    c.beginPath()
    c.moveTo(0.2, -0.9)
    c.bezierCurveTo(-0.07, -0.35, 0.15, 0.45, 0.06, 0.9)
    c.strokeStyle = '#d99699aa'
    c.lineWidth = 0.035
    c.stroke()
  }
  c.restore()
  c.save()
  c.rotate(-0.5)
  c.beginPath()
  c.ellipse(-0.34, -0.48, 0.18, 0.08, 0, 0, Math.PI * 2)
  c.fillStyle = '#ffffff66'
  c.fill()
  c.restore()
  c.beginPath()
  c.moveTo(0, -0.91)
  c.quadraticCurveTo(0.02, -1.15, 0.17, -1.14)
  c.strokeStyle = '#7a7150'
  c.lineWidth = 0.06
  c.stroke()
  c.beginPath()
  c.ellipse(0.24, -0.96, 0.22, 0.095, -0.5, 0, Math.PI * 2)
  c.fillStyle = '#75986c'
  c.fill()
  circle(-0.3, 0.03, 0.053, '#53483d')
  circle(0.3, 0.03, 0.053, '#53483d')
  c.beginPath()
  c.moveTo(-0.1, 0.24)
  c.quadraticCurveTo(0, 0.35, 0.1, 0.24)
  c.strokeStyle = '#53483d'
  c.lineWidth = 0.035
  c.stroke()
  for (const side of [-1, 1]) {
    c.beginPath()
    c.ellipse(side * 0.48, 0.22, 0.13, 0.07, 0, 0, Math.PI * 2)
    c.fillStyle = '#f8b6a980'
    c.fill()
  }
  c.restore()
}
function draw() {
  if (!context) return
  const c = context
  c.clearRect(0, 0, WIDTH, HEIGHT)
  c.lineWidth = 1
  c.setLineDash([5, 6])
  c.strokeStyle = danger.value ? '#d58d7b' : '#d7c8af'
  c.beginPath()
  c.moveTo(14, DANGER_Y)
  c.lineTo(WIDTH - 14, DANGER_Y)
  c.stroke()
  c.setLineDash([])
  c.fillStyle = '#ebdfc9'
  c.fillRect(0, HEIGHT - 8, WIDTH, 8)
  if (phase.value === 'playing') {
    c.save()
    c.setLineDash([3, 7])
    c.strokeStyle = '#b5c9a5'
    c.beginPath()
    c.moveTo(aim.value, DROP_Y + FRUITS[current.value].radius + 9)
    c.lineTo(aim.value, HEIGHT - 12)
    c.stroke()
    c.restore()
  }
  for (const fruit of world.fruits) drawFruit(fruit.x, fruit.y, fruit.level)
  if (phase.value === 'playing') drawFruit(aim.value, DROP_Y, current.value, FRUITS[current.value].radius, canDrop.value ? 1 : 0.35)
  for (const burst of bursts) {
    const progress = (world.time - burst.born) / 0.55
    c.save()
    c.globalAlpha = 1 - progress
    c.strokeStyle = FRUITS[burst.level].color
    c.lineWidth = 2
    c.beginPath()
    c.arc(burst.x, burst.y, FRUITS[burst.level].radius * (1 + progress * 0.65), 0, Math.PI * 2)
    c.stroke()
    c.font = 'bold 16px system-ui, sans-serif'
    c.textAlign = 'center'
    c.fillStyle = '#675741'
    c.fillText(`+${burst.points}`, burst.x, burst.y - FRUITS[burst.level].radius - 7 - progress * 18)
    c.restore()
  }
}
function resizeCanvas() {
  if (!canvas.value) return
  const scale = Math.min(window.devicePixelRatio || 1, 2)
  canvas.value.width = WIDTH * scale
  canvas.value.height = HEIGHT * scale
  context = canvas.value.getContext('2d')
  if (!context) return
  context.setTransform(scale, 0, 0, scale, 0, 0)
  draw()
}
onMounted(() => {
  try {
    const saved = Number(localStorage.getItem('little-arcade-watermelon-best'))
    best.value = Number.isSafeInteger(saved) && saved > 0 ? saved : 0
  } catch { /* Private browsing may disable storage. */ }
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resizeCanvas()
  document.addEventListener('visibilitychange', visibilityChanged)
  window.addEventListener('resize', resizeCanvas)
})
onUnmounted(() => {
  stopFrame()
  document.removeEventListener('visibilitychange', visibilityChanged)
  window.removeEventListener('resize', resizeCanvas)
  bursts = []
  context = null
})
</script>

<style scoped>
.watermelon-game { --fruit-ink: #51483d; --fruit-green: #789b72; color: var(--fruit-ink); width: 100%; max-width: 1120px; margin: auto; padding: 12px 20px 35px; font-family: 'Trebuchet MS', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; }
.watermelon-game * { box-sizing: border-box; }
.watermelon-game button, .watermelon-game input { font: inherit; }
.watermelon-game button { cursor: pointer; -webkit-tap-highlight-color: transparent; }
.watermelon-game button:focus-visible, .watermelon-game input:focus-visible, .watermelon-game canvas:focus-visible { outline: 3px solid #8ba578; outline-offset: 4px; }
.fruit-intro { text-align: center; margin: 10px auto 34px; }
.fruit-eyebrow { color: #94836b; font-size: 10px; font-weight: 800; letter-spacing: 1.8px; }
.fruit-intro h1 { font-size: clamp(28px, 4vw, 43px); letter-spacing: -1.8px; margin: 15px 0 12px; line-height: 1.3; }
.fruit-intro h1 span { color: #82a27a; }
.fruit-intro p { color: #9a8b78; font-size: 13px; line-height: 1.7; margin: 0; }
.fruit-layout { display: grid; grid-template-columns: minmax(280px, 430px) minmax(250px, 320px); gap: 32px; justify-content: center; align-items: start; }
.fruit-board { background: #fffcf5; border: 1px solid #e9dfcd; border-radius: 24px; padding: 20px 24px 16px; box-shadow: 0 10px 32px #8874560a; min-width: 0; }
.fruit-board-top { display: flex; justify-content: space-between; align-items: center; height: 25px; margin-bottom: 17px; }
.fruit-room { font-size: 11px; font-weight: 700; color: #8d806e; display: flex; align-items: center; gap: 7px; }
.fruit-room i { width: 6px; height: 6px; border-radius: 50%; background: #9bb18b; }
.fruit-room-decoration { color: #c5b18c; font-size: 21px; }
.fruit-pause { border: 1px solid #e4dccb; background: #faf5e8; color: #81735f; width: 36px; height: 32px; border-radius: 10px; }
.fruit-hud { display: flex; align-items: center; justify-content: space-between; padding: 0 5px 16px; }
.fruit-hud > div > span { font-size: 11px; color: #9b8d79; display: block; margin-bottom: 3px; }
.fruit-hud > div > strong { font-size: 31px; font-weight: 800; display: block; letter-spacing: -1px; }
.fruit-hud small, .fruit-best small { font-size: 11px; font-weight: 500; color: #a0927f; margin-left: 5px; letter-spacing: 0; }
.fruit-next { min-width: 86px; }
.fruit-next > span { margin-left: 6px; }
.fruit-next > div { display: flex; align-items: center; font-size: 12px; color: #83735f; }
.fruit-next svg { width: 37px; height: 37px; }
.fruit-jar { border: 2px solid #e1d7c2; border-top: 0; position: relative; border-radius: 0 0 19px 19px; background: radial-gradient(circle, #dbd2bc55 1px, transparent 1px) 0 0 / 18px 18px, linear-gradient(#fffcf5, #faf3e3); overflow: hidden; transition: border-color .2s; }
.fruit-jar.fruit-in-danger { border-color: #d9917d; }
.fruit-jar canvas { width: 100%; height: auto; aspect-ratio: 3 / 4; display: block; touch-action: none; cursor: crosshair; outline-offset: -4px !important; }
.fruit-rim-label { position: absolute; top: 17.1%; right: 12px; transform: translateY(-120%); color: #b5a38a; font-size: 9px; background: #fffbf2dc; padding: 2px 5px; border-radius: 4px; pointer-events: none; }
.fruit-rim-warning { color: #b36755; }
.fruit-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: #fffcf2bb; backdrop-filter: blur(3px); padding: 16px; }
.fruit-overlay-card { width: 100%; text-align: center; }
.fruit-mascot { display: block; margin: 0 auto 15px; width: 94px; height: 90px; }
.fruit-overlay-card .fruit-eyebrow { font-size: 8px; letter-spacing: 1.6px; }
.fruit-overlay-card h2 { font-size: 23px; margin: 13px 0 10px; letter-spacing: -1px; }
.fruit-overlay-card p { font-size: 11px; color: #96866e; line-height: 1.8; margin: 0 0 22px; }
.fruit-primary { border: 0; background: #829f75; color: #fffef8; border-radius: 13px; min-height: 48px; padding: 13px 19px; width: 88%; font-size: 12px !important; font-weight: 700 !important; display: inline-flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 0 #6c8b61; }
.fruit-primary:hover { background: #739266; }
.fruit-primary span { font-size: 18px; }
.fruit-text-button { display: block; margin: 18px auto 0; border: 0; background: none; color: #8f7f69; font-size: 11px !important; min-height: 32px; }
.fruit-controls { padding-top: 15px; }
.fruit-aim-label { display: flex; justify-content: space-between; font-size: 10px; color: #93816b; align-items: center; }
.fruit-aim-label span { font-size: 9px; color: #ae9e87; }
.fruit-controls input { width: 100%; accent-color: #829f75; margin: 3px 0 7px; height: 28px; cursor: pointer; }
.fruit-drop { display: flex; align-items: center; justify-content: space-between; width: 100%; border: 1px solid #dccdb0; border-radius: 12px; background: #f4ead6; padding: 13px 18px; color: #7f7056; min-height: 46px; font-size: 12px !important; font-weight: 700 !important; transition: background .2s; touch-action: manipulation; }
.fruit-drop:not(:disabled):hover { background: #eee0c3; }
.fruit-drop:disabled { opacity: .5; cursor: default; }
.fruit-controls > p { font-size: 9px; color: #ac9b80; text-align: center; margin: 12px 0 0; line-height: 1.5; }
.fruit-controls > p span { margin: 0 7px; }
.fruit-notebook { background: #fffcf5; border: 1px solid #e9dfcd; border-radius: 22px; padding: 28px 25px; }
.fruit-notebook-heading { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.fruit-notebook-heading .fruit-eyebrow { font-size: 8px; letter-spacing: 1.5px; }
.fruit-notebook-heading > span:last-child { font-size: 24px; color: #d3bb89; }
.fruit-notebook > h2 { font-size: 25px; letter-spacing: -1.2px; margin: 17px 0 11px; }
.fruit-description { color: #9b8b74; font-size: 12px; line-height: 1.9; margin: 0 0 24px; }
.fruit-best { display: flex; justify-content: space-between; align-items: center; background: #f4efdf; border-radius: 13px; padding: 17px 15px; color: #8d7a54; margin-bottom: 26px; }
.fruit-best > span { font-size: 11px; }
.fruit-best > strong { font-size: 20px; color: #857343; }
.fruit-evolution-heading { display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 16px; color: #8c7c65; }
.fruit-evolution-heading > span { font-size: 10px; color: #a8977f; }
.fruit-evolution { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px 4px; padding: 0; margin: 0 0 24px; list-style: none; }
.fruit-evolution li { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 3px 0 7px; border: 1px solid transparent; border-radius: 11px; opacity: .52; }
.fruit-evolution li.fruit-discovered { opacity: 1; }
.fruit-evolution li.fruit-current-goal { border-color: #d8e0c9; background: #f4f5e9; opacity: .85; }
.fruit-evolution svg { width: 39px; height: 39px; }
.fruit-evolution li span { font-size: 9px; color: #8e7e65; }
.fruit-how { border-top: 1px dashed #e4d9c5; padding-top: 20px; }
.fruit-how > span { font-size: 8px; letter-spacing: 1.6px; color: #aa9677; font-weight: bold; }
.fruit-how > p { font-size: 10px; line-height: 1.7; color: #998870; margin: 12px 0; }
.fruit-how b { color: #9fb38a; margin-right: 9px; font-size: 9px; }
.fruit-kind-note { display: flex; align-items: center; gap: 12px; background: #f5f2e6; border-radius: 12px; padding: 14px 13px; margin-top: 23px; }
.fruit-kind-note > span { color: #a2b28c; font-size: 28px; }
.fruit-kind-note p { font-size: 9px; line-height: 1.8; color: #a3957d; margin: 0; }
.fruit-kind-note strong { font-weight: 500; color: #8a9273; }
.fruit-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (max-width: 720px) {
  .watermelon-game { padding: 8px 16px 28px; }
  .fruit-layout { grid-template-columns: minmax(0, 420px); gap: 22px; }
  .fruit-intro { margin: 6px auto 24px; }
  .fruit-intro h1 { font-size: 29px; letter-spacing: -1.4px; }
  .fruit-intro p { font-size: 11px; }
  .fruit-board { padding: 17px 17px 14px; border-radius: 20px; }
  .fruit-board-top { margin-bottom: 10px; }
  .fruit-hud { padding-bottom: 12px; }
  .fruit-hud > div > strong { font-size: 27px; }
  .fruit-notebook { padding: 23px; }
  .fruit-evolution { grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px 3px; }
  .fruit-evolution svg { width: 36px; height: 36px; }
}
@media (max-width: 360px) {
  .fruit-board { padding: 13px 10px; }
  .fruit-intro h1 { font-size: 25px; }
  .fruit-overlay-card h2 { font-size: 20px; }
  .fruit-evolution { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) { .watermelon-game * { transition: none !important; } }
</style>
