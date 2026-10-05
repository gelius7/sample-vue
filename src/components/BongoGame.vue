<template>
  <section class="club" :class="['difficulty-' + difficultyId, { 'round-focused': phase !== 'idle' }]">
    <header class="topbar">
      <span class="brand"><span class="brand-icon">♬</span> BONGO CAT<span class="brand-dot">●</span></span>
      <button class="sound-button" :aria-pressed="muted" @click="toggleMute">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z"/><path v-if="!muted" d="M15 8q4 4 0 8m3-11q7 7 0 14"/><path v-else d="m16 9 6 6m0-6-6 6"/></svg>
        {{ muted ? '소리 꺼짐' : '소리 켜짐' }}
      </button>
    </header>

    <section class="intro">
      <span class="eyebrow"><span></span> LITTLE PAWS, BIG GROOVE</span>
      <h1>오늘도, <span>냥냥하게.</span></h1>
      <p>동요부터 빠른 클래식까지, 열두 곡을 다섯 가지 소리로 톡톡!</p>
    </section>

    <fieldset class="difficulty-picker" aria-describedby="difficulty-help">
      <legend>1. 난이도별 곡 모음</legend>
      <button v-for="level in DIFFICULTIES" :key="level.id" :class="{ selected: level.id === difficultyId }" :aria-pressed="level.id === difficultyId" @click="chooseDifficulty(level.id)">
        <strong>{{ level.title }}</strong><small>{{ SONGS.filter(song => song.difficulty === level.id).length }}곡 · {{ level.subtitle }}</small>
      </button>
    </fieldset>
    <p id="difficulty-help" class="difficulty-help">{{ difficulty.description }}<span>모든 곡의 판정은 같아요. 곡 고유의 빠르기와 박자로 도전해요.</span></p>
    <fieldset class="song-picker">
      <legend>2. {{ difficulty.title }} · 오늘의 연주곡</legend>
      <button v-for="song in filteredSongs" :key="song.id" :class="{ selected: song.id === selectedId }" :aria-pressed="song.id === selectedId" @click="chooseSong(song.id)">
        <span class="song-icon" aria-hidden="true">{{ song.icon }}</span><span><strong>{{ song.title }}</strong><small>{{ song.subtitle }}</small><small class="song-tempo">{{ song.bpm }} BPM</small></span><span class="song-check" aria-hidden="true">{{ song.id === selectedId ? '✓' : '♪' }}</span>
      </button>
    </fieldset>
    <div class="game-layout">
      <section class="studio" aria-label="고양이 리듬 게임">
        <div class="mobile-hud">
          <div class="mobile-song"><strong>{{ selectedSong.title }}</strong><span>{{ score.toLocaleString() }} pt · {{ combo }} 콤보 · {{ phase === 'finished' ? accuracy + '%' : seconds + '초' }}</span></div>
          <button :aria-label="muted ? '소리 켜기' : '소리 끄기'" :aria-pressed="muted" @click="toggleMute">{{ muted ? '♪̸' : '♪' }}</button>
          <button :disabled="phase === 'loading'" @click="phase === 'playing' ? pause() : phase === 'paused' ? resume() : start()">{{ phase === 'playing' ? '일시정지' : phase === 'paused' ? '이어하기' : phase === 'loading' ? '준비' : '다시' }}</button>
          <button @click="freePlay">곡 선택</button>
        </div>
        <div class="studio-top"><span class="room-label"><i></i> 냥냥 리듬 클럽</span><span class="tempo">{{ difficulty.title }} · {{ selectedSong.bpm }} BPM <span>✦</span></span></div>
        <div class="stage" :class="{ grooving: pawActive[0] || pawActive[1] }">
          <span class="stage-star star-one" aria-hidden="true">✧</span><span class="stage-star star-two" aria-hidden="true">✦</span>
          <span class="music-note note-one" aria-hidden="true">♪</span><span class="music-note note-two" aria-hidden="true">♫</span>
          <div class="speech">{{ phase === 'finished' ? '멋진 연주였어, 냥!' : combo >= 5 ? '지금 느낌 좋은데? ♡' : '같이 두드릴래? ♡' }}</div>
          <svg class="cat" viewBox="0 0 400 250" role="img" aria-label="봉고를 치는 크림색 고양이">
            <ellipse cx="200" cy="234" rx="162" ry="11" fill="#dec8ad" opacity=".32"/>
            <path d="M287 191q45-63 60-28q9 23-29 36" fill="none" stroke="#514538" stroke-width="24" stroke-linecap="round"/>
            <path d="M287 191q45-63 60-28q9 23-29 36" fill="none" stroke="#fffaf0" stroke-width="18" stroke-linecap="round"/>
            <path d="M108 202q-14-24-5-82L94 47q0-13 12-6l44 31q50-19 99 0l43-31q12-7 12 6l-9 74q13 53-7 82Z" fill="#fffaf0" stroke="#514538" stroke-width="4.5" stroke-linejoin="round"/>
            <path d="m108 57 6 42 25-19Zm182 0-7 42-24-19Z" fill="#f4b3a0"/>
            <path d="M173 68q7 15 5 27m22-31v25m22-21q-7 15-5 27" stroke="#eddbc0" stroke-width="8" stroke-linecap="round" fill="none"/>
            <g v-if="combo >= 5 || pawActive[0] || pawActive[1]" fill="none" stroke="#514538" stroke-width="4.5" stroke-linecap="round"><path d="m147 128 9-7 9 7m71 0 9-7 9 7"/></g>
            <g v-else fill="#514538"><ellipse cx="157" cy="126" rx="4.5" ry="7"/><ellipse cx="243" cy="126" rx="4.5" ry="7"/></g>
            <ellipse cx="137" cy="145" rx="15" ry="8" fill="#f7c7b6"/><ellipse cx="263" cy="145" rx="15" ry="8" fill="#f7c7b6"/>
            <path d="m194 135 6 5 6-5" fill="#d89184" stroke="#d89184" stroke-width="3" stroke-linejoin="round"/>
            <path d="M200 141v5q-8 11-16 1m16-1q8 11 16 1" fill="none" stroke="#514538" stroke-width="3.5" stroke-linecap="round"/>
            <path d="m104 132 18 4m-18 8 17-1m157-7 18-4m-17 11 17 1" stroke="#514538" stroke-width="2.5" stroke-linecap="round"/>
            <g class="drum-art" :class="{ bonk: pawActive[0] }"><path d="m49 187 12 51q46 17 90-1l14-50" fill="#e99c7f" stroke="#514538" stroke-width="4"/><path d="m73 195 5 41m34-36v42m34-47-8 40" stroke="#b7735f" stroke-width="3"/><ellipse cx="107" cy="185" rx="60" ry="21" fill="#ffe3b2" stroke="#514538" stroke-width="4"/><ellipse cx="107" cy="182" rx="49" ry="13" fill="#fff0d2"/></g>
            <g class="drum-art" :class="{ bonk: pawActive[1] }"><path d="m236 187 13 51q46 17 90-1l14-50" fill="#aaa0cf" stroke="#514538" stroke-width="4"/><path d="m260 195 5 41m34-36v42m34-47-8 40" stroke="#8276a5" stroke-width="3"/><ellipse cx="294" cy="185" rx="60" ry="21" fill="#e9ddff" stroke="#514538" stroke-width="4"/><ellipse cx="294" cy="182" rx="49" ry="13" fill="#f4ecff"/></g>
            <g class="paw paw-left" :class="{ down: pawActive[0] }"><path d="M148 167q-13-31-32-23q-23 10-13 31q9 18 28 12q15-4 17-20" fill="#fffaf0" stroke="#514538" stroke-width="4"/><path d="m112 167 3 7m5-9 3 7" stroke="#d8c4a7" stroke-width="2.5" stroke-linecap="round"/></g>
            <g class="paw paw-right" :class="{ down: pawActive[1] }"><path d="M252 167q13-31 32-23q23 10 13 31q-9 18-28 12q-15-4-17-20" fill="#fffaf0" stroke="#514538" stroke-width="4"/><path d="m288 167-3 7m-5-9-3 7" stroke="#d8c4a7" stroke-width="2.5" stroke-linecap="round"/></g>
          </svg>
        </div>

        <div ref="trackElement" class="track" :class="{ 'track-idle': phase !== 'playing' }" aria-hidden="true">
          <div v-for="(pad, side) in pads" :key="side" class="lane" :style="{ left: side * 20 + '%', '--pad-color': pad.color }"></div>
          <div class="hit-line" :style="{ top: hitLineY + 'px' }"><span v-for="(pad, side) in pads" :key="side" :style="{ borderColor: pad.color }"></span></div>
          <div v-for="note in visibleNotes" :key="note.id" class="beat" :style="{ top: noteY(note) + 'px', left: (note.side * 20 + 10) + '%', background: pads[note.side].color }">{{ pads[note.side].key }}</div>
          <span v-if="phase !== 'playing'" class="track-hint">{{ phase === 'paused' ? '잠깐 쉬는 중 ☾' : phase === 'finished' ? '연주 끝! ' + score.toLocaleString() + '점 · 정확도 ' + accuracy + '%' : phase === 'loading' ? '연주를 준비하고 있어요…' : '원을 선에 맞춰 톡!' }}</span>
          <span v-else-if="elapsed < roundLeadIn" class="track-hint">준비 · {{ Math.ceil((roundLeadIn - elapsed) / 1000) }}초</span>
          <span v-if="feedback" :key="feedbackId" class="feedback" :class="feedbackKind">{{ feedback }}</span>
        </div>

        <div class="pads">
          <button v-for="(pad, side) in pads" :key="side" class="pad" :class="{ pressed: active[side], unused: !selectedSong.lanes.includes(side) }" :style="{ '--pad-color': pad.color }" :aria-label="pad.name + ', ' + pad.key + ' 키'" @pointerdown.prevent="tap(side)" @click="accessibleTap($event, side)">
            <span class="pad-caption">{{ pad.name }}</span><strong>{{ pad.sound }}</strong><span class="keycap">{{ pad.key }}</span>
          </button>
        </div>
        <div class="studio-bottom"><span>✦ 터치로 톡톡</span><span>키보드 A · S · D · K · L</span></div>
      </section>

      <aside class="session">
        <div class="session-heading"><span class="eyebrow">YOUR LITTLE JAM</span><span aria-hidden="true">✺</span></div>
        <h2>{{ phase === 'finished' ? '수고했어, 집사!' : '리듬을 타볼까요?' }}</h2>
        <p class="session-description">{{ phase === 'finished' ? '작은 앞발로 만든 근사한 무대. 한 번 더 놀아 볼까요?' : '내려오는 원이 선에 닿으면 같은 색 봉고를 두드려 주세요.' }}</p>
        <div class="scoreboard">
          <div class="score-main"><span>나의 점수</span><strong data-testid="score">{{ score.toLocaleString() }}<small>pt</small></strong></div>
          <div class="score-details"><div><span>콤보</span><strong data-testid="combo">{{ combo }}<small>×</small></strong></div><div><span>{{ phase === 'finished' ? '정확도' : '남은 시간' }}</span><strong>{{ phase === 'finished' ? accuracy + '%' : seconds }}<small v-if="phase !== 'finished'">초</small></strong></div></div>
          <div class="progress" role="progressbar" aria-label="라운드 진행" :aria-valuenow="Math.round(elapsed / duration * 100)" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: elapsed / duration * 100 + '%' }"></span></div>
        </div>
        <p class="pad-guide">사용 버튼 {{ selectedSong.lanes.map(side => pads[side].key).join(' · ') }}<span>곡을 바꾸면 새로 시작해요.</span></p>
        <p class="playing-song">{{ selectedSong.title }} <span>· {{ difficulty.title }} · {{ chart.length }}개 음표 · 약 {{ Math.ceil(duration / 1000) }}초</span></p>
        <p class="best"><span>♕ 이 곡 · {{ difficulty.title }} 최고 기록</span><strong>{{ best.toLocaleString() }} pt</strong></p>
        <button v-if="phase === 'playing'" class="start-button secondary" @click="pause">잠깐 쉬기 <span>Ⅱ</span></button>
        <button v-else class="start-button" :disabled="phase === 'loading'" @click="phase === 'paused' ? resume() : start()">{{ phase === 'loading' ? '음악 불러오는 중…' : phase === 'paused' ? '이어서 연주하기' : phase === 'finished' ? '한 번 더 연주하기' : '선택한 곡으로 시작' }}<span>→</span></button>
        <button v-if="phase === 'paused' || phase === 'finished'" class="free-button" @click="freePlay">자유 연주로 돌아가기</button>
        <p v-else class="free-note">{{ phase === 'playing' ? '잘못 쳐도 괜찮아요. 계속 두드려 봐요!' : '시작 전에는 자유롭게 연주할 수 있어요.' }}</p>
        <p v-if="audioError" class="audio-error" role="alert">{{ audioError }}</p>
        <div class="tip"><span aria-hidden="true">♡</span><p>잘하는 것보다 즐거운 게 중요해요.<br><strong>고양이는 언제나 당신 편!</strong></p></div>
        <p class="sr-only" aria-live="polite">{{ announcement }}</p>
      </aside>
    </div>
    <details class="music-credits"><summary>음악 출처와 라이선스</summary>
      <p>동요와 클래식은 역사적 멜로디를 직접 합성한 짧은 연주예요. 현대 음원이나 편곡을 복사하지 않았어요.</p>
      <p v-for="song in SONGS.filter(item => item.credit)" :key="song.id"><a :href="song.credit.source" target="_blank" rel="noopener noreferrer">{{ song.title }}</a> · Kevin MacLeod (incompetech.com) · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a><br>게임용 발췌, 음량 조절과 페이드 적용. 음악의 라이선스는 게임 코드와 별개예요.</p>
    </details>
    <footer>MADE FOR YOUR PAWS <span>·</span> 작은 리듬이 필요한 모든 순간에</footer>
  </section>
</template>

<script setup>
/* eslint-env browser, es6 */
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { APPROACH_MS, HIT_WINDOW, DIFFICULTIES, createNotes, expireNotes, judgeHit } from '../rhythm.mjs'
import { LEAD_IN_MS, SONGS, songTimeline } from '../songs.mjs'

const selectedId = ref(SONGS[0].id)
const difficultyId = ref(SONGS[0].difficulty)
const difficulty = computed(() => DIFFICULTIES.find(level => level.id === difficultyId.value))
const selectedSong = computed(() => SONGS.find(song => song.id === selectedId.value))
const filteredSongs = computed(() => SONGS.filter(song => song.difficulty === difficultyId.value))
const roundLeadIn = ref(LEAD_IN_MS)
const chart = computed(() => createNotes(selectedSong.value, roundLeadIn.value))
const recordKey = computed(() => `bongo-cat-best-v4-${selectedId.value}`)
const timeline = computed(() => songTimeline(selectedSong.value, roundLeadIn.value))
const duration = computed(() => timeline.value.duration)
const pads = [
  { name: '킥', key: 'A', sound: '둥', color: '#eca383', wave: 'sine', high: 180, low: 55 },
  { name: '스네어', key: 'S', sound: '탁', color: '#e1bb62', wave: 'square', high: 260, low: 95 },
  { name: '우드블록', key: 'D', sound: '톡', color: '#91b69b', wave: 'triangle', high: 850, low: 600 },
  { name: '탐', key: 'K', sound: '통', color: '#88accc', wave: 'sine', high: 330, low: 130 },
  { name: '벨', key: 'L', sound: '챙', color: '#b7a5d9', wave: 'sine', high: 1200, low: 900 },
]
const phase = ref('idle')
const notes = ref([])
const elapsed = ref(0)
const score = ref(0)
const combo = ref(0)
const hits = ref(0)
const best = ref(0)
const muted = ref(false)
const audioError = ref('')
const active = ref(Array(5).fill(false))
const pawActive = computed(() => [active.value.slice(0, 3).some(Boolean), active.value.slice(3).some(Boolean)])
const feedback = ref('')
const feedbackKind = ref('')
const feedbackId = ref(0)
const announcement = ref('난이도별 곡 모음에서 노래를 고르세요. 시작 전에는 봉고를 자유롭게 연주할 수 있어요.')
const seconds = computed(() => Math.max(0, Math.ceil((duration.value - elapsed.value) / 1000)))
const accuracy = computed(() => Math.round(hits.value / Math.max(1, notes.value.length) * 100))
const trackElement = ref(null)
const trackHeight = ref(86)
const mobileViewport = ref(false)
// Preserve the former pixels/second at each difficulty (excluding the 2px border).
// A taller track adds preview time, rather than making notes faster.
const fallSpeed = ref(84 * .8 / APPROACH_MS)
const hitLineY = computed(() => mobileViewport.value && phase.value !== 'idle' ? Math.max(0, trackHeight.value - 24) : trackHeight.value * .8)
const approachMs = computed(() => hitLineY.value / fallSpeed.value)
const visibleNotes = computed(() => notes.value.filter(n => !n.hit && !n.missed && n.time - elapsed.value <= approachMs.value && n.time - elapsed.value >= -HIT_WINDOW))
let trackObserver
function measureTrack() {
  mobileViewport.value = window.matchMedia('(max-width: 740px)').matches
  if (trackElement.value) trackHeight.value = trackElement.value.clientHeight
}
function setFallSpeed() {
  const heights = mobileViewport.value ? { easy: 86, normal: 140, hard: 180 } : { easy: 107, normal: 150, hard: 190 }
  fallSpeed.value = (heights[difficultyId.value] - 2) * .8 / APPROACH_MS
}
let frame, startedAt = 0, audioStartedAt = 0, audio, master, feedbackTimer, startVersion = 0
const audioBuffers = new Map()
const voices = new Set()
const pawTimers = []

function noteY(note) { return hitLineY.value - (note.time - elapsed.value) * fallSpeed.value }
function ensureAudio() {
  try {
    if (!audio) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      audio = new AudioContext()
      master = audio.createGain()
      master.gain.value = muted.value ? 0 : 0.4
      master.connect(audio.destination)
    }
    if (audio.state === 'suspended') audio.resume().catch(() => {})
  } catch { /* Sound is optional; gameplay stays available. */ }
}
function sound(side) {
  if (!audio || !master || muted.value || audio.state !== 'running') return
  const now = audio.currentTime
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = pads[side].wave
  osc.frequency.setValueAtTime(pads[side].high, now)
  osc.frequency.exponentialRampToValueAtTime(pads[side].low, now + 0.12)
  gain.gain.setValueAtTime(side === 1 ? 0.12 : 0.38, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
  osc.connect(gain)
  gain.connect(master)
  voices.add(osc)
  osc.start(now)
  osc.stop(now + 0.22)
  osc.onended = () => { voices.delete(osc); osc.disconnect(); gain.disconnect() }
}
function stopMusic() {
  for (const voice of voices) { try { voice.stop() } catch { /* Already ended. */ } }
  voices.clear()
}
function playTone(note, offset, bass = false) {
  const remaining = note.time + note.duration - offset
  if (note.midi === null || remaining <= 0) return
  const when = audio.currentTime + Math.max(0, note.time - offset) / 1000
  const length = Math.min(note.duration, remaining) / 1000
  const oscillator = audio.createOscillator()
  const envelope = audio.createGain()
  oscillator.type = bass ? 'sine' : 'triangle'
  oscillator.frequency.value = 440 * 2 ** ((note.midi - 69) / 12)
  envelope.gain.setValueAtTime(0, when)
  envelope.gain.linearRampToValueAtTime(bass ? 0.075 : 0.22, when + 0.012)
  envelope.gain.exponentialRampToValueAtTime(0.001, when + Math.max(0.03, length * 0.92))
  oscillator.connect(envelope)
  envelope.connect(master)
  voices.add(oscillator)
  oscillator.start(when)
  oscillator.stop(when + length)
  oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect() }
}
function scheduleMusic(offset) {
  stopMusic()
  if (!audio || !master) return
  audioStartedAt = audio.currentTime - offset / 1000
  if (selectedSong.value.audioFile) {
    const buffer = audioBuffers.get(selectedId.value)
    const position = Math.max(0, offset - roundLeadIn.value) / 1000
    if (buffer && position < buffer.duration) {
      const source = audio.createBufferSource()
      source.buffer = buffer
      source.connect(master)
      voices.add(source)
      source.start(audio.currentTime + Math.max(0, roundLeadIn.value - offset) / 1000, position)
      source.onended = () => { voices.delete(source); source.disconnect() }
    }
    return
  }
  timeline.value.melody.forEach(note => playTone(note, offset))
  timeline.value.bass.forEach(note => playTone(note, offset, true))
}
function currentElapsed() {
  const time = audio && audio.state === 'running' ? (audio.currentTime - audioStartedAt) * 1000 : performance.now() - startedAt
  return Math.max(0, Math.min(duration.value, time))
}
function readBest() {
  best.value = 0
  try {
    const saved = Number(localStorage.getItem(recordKey.value))
    best.value = Number.isSafeInteger(saved) && saved > 0 ? saved : 0
  } catch { /* Storage is optional. */ }
}
function chooseSong(id) {
  if (id === selectedId.value || !SONGS.some(song => song.id === id)) return
  freePlay()
  selectedId.value = id
  difficultyId.value = selectedSong.value.difficulty
  readBest()
  announcement.value = `${selectedSong.value.title} 선택. 시작 버튼을 눌러 연주하세요.`
}
function chooseDifficulty(id) {
  if (id === difficultyId.value || !DIFFICULTIES.some(level => level.id === id)) return
  freePlay()
  difficultyId.value = id
  selectedId.value = filteredSongs.value[0].id
  readBest()
  announcement.value = `${difficulty.value.title} 선택. ${difficulty.value.description}. 시작 버튼을 눌러 연주하세요.`
}
function toggleMute() {
  muted.value = !muted.value
  ensureAudio()
  if (master) master.gain.value = muted.value ? 0 : 0.4
}
function showFeedback(text, kind) {
  feedback.value = text
  feedbackKind.value = kind
  feedbackId.value++
  clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => { feedback.value = '' }, 500)
}
function tap(side) {
  ensureAudio()
  sound(side)
  active.value[side] = true
  clearTimeout(pawTimers[side])
  pawTimers[side] = setTimeout(() => { active.value[side] = false }, 120)
  if (phase.value !== 'playing') return
  elapsed.value = currentElapsed()
  if (expireNotes(notes.value, elapsed.value)) combo.value = 0
  const result = judgeHit(notes.value, side, elapsed.value)
  if (result) {
    combo.value++
    hits.value++
    score.value += (result.perfect ? 100 : 70) + Math.min(combo.value, 20) * 2
    showFeedback(result.perfect ? 'PERFECT ♡' : 'GOOD ♪', result.perfect ? 'perfect' : 'good')
  } else {
    combo.value = 0
    showFeedback('조금만 맞춰볼까?', 'miss')
  }
}
function accessibleTap(event, side) { if (event.detail === 0) tap(side) }
function finish() {
  cancelAnimationFrame(frame)
  stopMusic()
  phase.value = 'finished'
  elapsed.value = duration.value
  combo.value = 0
  feedback.value = ''
  if (score.value > best.value) {
    best.value = score.value
    try { localStorage.setItem(recordKey.value, String(best.value)) } catch { /* Private browsers may disable storage. */ }
  }
  announcement.value = `연주 끝! ${score.value}점, 정확도 ${accuracy.value}퍼센트. 다시 연주할 수 있어요.`
}
function update() {
  if (phase.value !== 'playing') return
  elapsed.value = currentElapsed()
  if (expireNotes(notes.value, elapsed.value)) { combo.value = 0; showFeedback('다음 박자에 톡!', 'miss') }
  if (elapsed.value >= duration.value) { finish(); return }
  frame = requestAnimationFrame(update)
}
async function start() {
  freePlay()
  const version = startVersion
  ensureAudio()
  phase.value = 'loading'
  if (selectedSong.value.audioFile) {
    phase.value = 'loading'
    try {
      if (!audio) throw new Error('Web Audio unavailable')
      if (!audioBuffers.has(selectedId.value)) {
        const id = selectedId.value
        const response = await fetch(process.env.BASE_URL + selectedSong.value.audioFile)
        if (!response.ok) throw new Error('Audio download failed')
        const buffer = await audio.decodeAudioData(await response.arrayBuffer())
        audioBuffers.set(id, buffer)
      }
      if (version !== startVersion) return
    } catch {
      if (version !== startVersion) return
      phase.value = 'idle'
      audioError.value = '음악을 불러오지 못했어요. 연결을 확인한 뒤 시작 버튼으로 다시 시도해 주세요.'
      return
    }
  }
  await nextTick()
  if (version !== startVersion) return
  measureTrack()
  setFallSpeed()
  roundLeadIn.value = Math.max(LEAD_IN_MS, Math.ceil(approachMs.value + 200))
  notes.value = createNotes(selectedSong.value, roundLeadIn.value)
  score.value = 0
  combo.value = 0
  hits.value = 0
  elapsed.value = 0
  feedback.value = ''
  phase.value = 'playing'
  startedAt = performance.now()
  scheduleMusic(0)
  announcement.value = `${selectedSong.value.title}, ${difficulty.value.title} 연주 시작! 내려오는 원에 맞춰 A, S, D, K, L 버튼을 치세요.`
  frame = requestAnimationFrame(update)
}
function pause() {
  if (phase.value !== 'playing') return
  elapsed.value = currentElapsed()
  cancelAnimationFrame(frame)
  stopMusic()
  phase.value = 'paused'
  feedback.value = ''
  announcement.value = '잠시 멈췄어요. 이어서 연주하기를 누르면 계속할 수 있어요.'
}
function resume() {
  if (phase.value !== 'paused') return
  ensureAudio()
  startedAt = performance.now() - elapsed.value
  scheduleMusic(elapsed.value)
  phase.value = 'playing'
  frame = requestAnimationFrame(update)
  announcement.value = '이어서 연주합니다.'
}
function freePlay() {
  startVersion++
  audioError.value = ''
  cancelAnimationFrame(frame)
  stopMusic()
  clearTimeout(feedbackTimer)
  pawTimers.forEach(clearTimeout)
  active.value = Array(5).fill(false)
  hits.value = 0
  phase.value = 'idle'
  roundLeadIn.value = LEAD_IN_MS
  notes.value = []
  elapsed.value = 0
  score.value = 0
  combo.value = 0
  feedback.value = ''
  announcement.value = '자유 연주. 봉고를 마음껏 두드려 보세요.'
}
function keydown(event) {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return
  const key = event.key.toLowerCase()
  const side = { a: 0, s: 1, d: 2, k: 3, l: 4, arrowleft: 0, arrowright: 4 }[key]
  if (side !== undefined) { event.preventDefault(); tap(side) }
}
function visibility() {
  if (!document.hidden) return
  if (phase.value === 'loading') freePlay()
  else pause()
}
onMounted(() => {
  readBest()
  measureTrack()
  if (typeof ResizeObserver !== 'undefined') {
    trackObserver = new ResizeObserver(measureTrack)
    if (trackElement.value) trackObserver.observe(trackElement.value)
  }
  window.addEventListener('resize', measureTrack)
  window.addEventListener('keydown', keydown)
  document.addEventListener('visibilitychange', visibility)
})
onUnmounted(() => {
  startVersion++
  cancelAnimationFrame(frame)
  stopMusic()
  clearTimeout(feedbackTimer)
  pawTimers.forEach(clearTimeout)
  if (trackObserver) trackObserver.disconnect()
  window.removeEventListener('resize', measureTrack)
  window.removeEventListener('keydown', keydown)
  document.removeEventListener('visibilitychange', visibility)
  if (audio) audio.close().catch(() => {})
})
</script>

<style scoped>

.club{max-width:1120px;margin:auto;padding:30px 48px 20px}.topbar{display:flex;justify-content:space-between;align-items:center}.brand{display:flex;gap:10px;align-items:center;font-size:17px;font-weight:1000;letter-spacing:1px}.brand-icon{background:#edac91;width:31px;height:31px;border-radius:10px;text-align:center;line-height:30px;font-size:24px;letter-spacing:0}.brand-dot{font-size:8px;color:#d89777;margin-left:-4px}.sound-button{border:1px solid #e3ddcf;background:transparent;padding:9px 13px;border-radius:22px;display:flex;gap:8px;align-items:center;font-size:11px;font-weight:700}.sound-button svg{height:15px;width:15px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.intro{text-align:center;margin:42px 0 32px}.eyebrow{font-size:9px;font-weight:900;letter-spacing:2px;color:#9b8870}.intro .eyebrow{display:inline-flex;gap:7px;align-items:center}.eyebrow>span{height:5px;width:5px;background:#b6c39a;border-radius:50%}h1{font-size:38px;letter-spacing:-1.8px;margin:10px 0 12px;font-weight:900}h1>span{color:#bc7e63}.intro p{font-size:12px;color:var(--muted);margin:0}.game-layout{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(260px,1fr);gap:32px;align-items:center}.studio{background:#fffdf8;border:1px solid #e6dfd0;border-radius:24px;box-shadow:0 8px 0 #efe9dc;overflow:hidden;position:relative}.studio-top{display:flex;justify-content:space-between;align-items:center;padding:19px 24px 0;font-size:10px}.room-label{display:flex;align-items:center;gap:6px;font-weight:700;color:#8c806e}.room-label i{display:inline-block;height:6px;width:6px;background:#a8b98f;border-radius:50%}.tempo{color:#aaa18e;font-weight:800;font-size:9px;letter-spacing:1px}.tempo span{margin-left:9px;color:#d7aa7c;font-size:15px}.stage{height:258px;position:relative;background:radial-gradient(ellipse at 50% 100%,#f7efdf 0,transparent 65%)}.cat{position:absolute;width:88%;height:245px;bottom:-2px;left:6%;overflow:visible}.speech{position:absolute;top:20px;left:50%;transform:translateX(-50%) rotate(-4deg);background:#f6f0e3;padding:7px 14px;border-radius:12px;font-size:10px;white-space:nowrap;z-index:1}.speech:after{content:'';position:absolute;bottom:-5px;left:48%;border-top:7px solid #f6f0e3;border-right:7px solid transparent}.stage-star,.music-note{position:absolute;color:#ccb585;font-size:24px}.star-one{left:9%;top:85px}.star-two{right:10%;top:66px;font-size:16px}.music-note{color:#d7b2a0;font-size:24px;transition:transform .12s}.note-one{left:12%;top:147px;transform:rotate(-18deg)}.note-two{right:9%;top:134px;transform:rotate(18deg);color:#b9abd0}.grooving .music-note{transform:translateY(-9px) rotate(12deg)}.paw{transition:transform 60ms ease;transform-box:fill-box;transform-origin:center}.paw-left{transform:translateY(-12px) rotate(-10deg)}.paw-right{transform:translateY(-12px) rotate(10deg)}.paw.down{transform:translateY(9px) rotate(0)}.drum-art{transition:transform 60ms;transform-origin:center bottom}.drum-art.bonk{transform:scaleY(.96)}.track{position:relative;height:107px;margin:5px 26px 12px;overflow:hidden;border-radius:10px;background:#fbf7ef;border:1px solid #f0e8da}.lane{position:absolute;width:50%;height:100%;background:repeating-linear-gradient(0deg,transparent,transparent 25px,#e9e1d34d 26px)}.lane-left{border-right:1px dashed #e2d7c5}.lane-right{left:50%}.hit-line{position:absolute;top:80%;width:100%;border-top:2px dashed #cabca6;display:flex;justify-content:space-around}.hit-line span{border:2px solid #dfa285;width:38px;height:24px;border-radius:20px;transform:translateY(-50%);background:#fff9f0}.hit-line span+span{border-color:#b3a0ce}.beat{position:absolute;transform:translate(-50%,-50%);border-radius:50%;width:26px;height:26px;line-height:23px;text-align:center;font-size:11px;font-weight:1000;border:2px solid #fffaf0;box-shadow:0 2px 0 #00000012}.beat-left{left:25%;background:#eca383}.beat-right{left:75%;background:#b7a5d9}.track-hint{position:absolute;top:24px;left:0;right:0;text-align:center;color:#a59881;font-size:10px;letter-spacing:1px}.feedback{position:absolute;z-index:2;left:50%;top:25px;transform:translateX(-50%);padding:4px 10px;background:#fffdf6e8;border-radius:12px;white-space:nowrap;font-size:12px;font-weight:1000;animation:pop .18s ease-out}.feedback.perfect{color:#a77b42}.feedback.good{color:#8971ae}.feedback.miss{color:#9d9280;font-size:10px}.pads{display:grid;grid-template-columns:1fr 1fr;gap:15px;padding:0 26px}.pad{position:relative;border:1px solid #dba087;border-bottom:5px solid #d09074;border-radius:16px;min-height:85px;background:#f6b89d;user-select:none;transition:transform .06s,border-width .06s;touch-action:none;overflow:hidden}.pad-right{border-color:#a594be;border-bottom-color:#9987b3;background:#c9b8e5}.pad.pressed,.pad:active{transform:translateY(3px);border-bottom-width:2px}.pad-caption{position:absolute;top:13px;left:17px;font-size:9px;opacity:.7;font-weight:800}.pad strong{display:block;text-align:left;font-size:28px;margin:24px 10px 0;line-height:1.2}.keycap{position:absolute;right:15px;top:25px;font-weight:900;border:1px solid #ffffff75;background:#ffffff36;border-radius:7px;height:27px;width:27px;line-height:25px;font-size:13px}.studio-bottom{display:flex;justify-content:space-between;padding:16px 27px 19px;color:#a69986;font-size:9px}.session{padding:14px 2px}.session-heading{display:flex;justify-content:space-between;align-items:center}.session-heading>span+span{font-size:26px;color:#bcb097}.session-heading .eyebrow{font-size:8px;letter-spacing:1.7px}.session h2{font-size:24px;letter-spacing:-1px;margin:12px 0 10px;font-weight:900}.session-description{color:var(--muted);font-size:11px;line-height:1.9;max-width:270px;margin:0 0 22px;word-break:keep-all}.scoreboard{background:#f2ede2;border:1px solid #e9e2d5;border-radius:17px;padding:19px}.score-main>span,.score-details span{font-size:10px;color:#9a8e7b}.score-main>strong{display:block;font-size:43px;font-weight:1000;line-height:1.3;letter-spacing:-1px;margin-top:2px}.score-main small{font-size:12px;letter-spacing:0;color:#b4a791;margin-left:6px;font-weight:700}.score-details{display:flex;margin-top:16px}.score-details>div{width:50%;display:flex;flex-direction:column;gap:3px}.score-details>div+div{padding-left:20px;border-left:1px solid #e2d9c9}.score-details strong{font-size:23px;font-weight:900}.score-details small{font-size:10px;margin-left:3px;color:#a09079}.progress{height:4px;border-radius:4px;background:#e3dcca;overflow:hidden;margin-top:18px}.progress>span{display:block;height:100%;background:#c2aa84;border-radius:4px}.best{display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#9c8f79;margin:15px 3px 21px}.best strong{font-size:11px;color:#8c7a60}.start-button{display:flex;justify-content:space-between;align-items:center;width:100%;border:0;border-bottom:4px solid #3d362c;background:#544b3e;border-radius:12px;color:#fffaf1;padding:16px;font-size:11px;font-weight:800;min-height:52px}.start-button:hover{background:#665b4b}.start-button>span{font-size:18px;line-height:10px}.start-button.secondary{background:#e9e1d1;border-color:#d5c9b5;color:#6e614e}.free-note,.free-button{text-align:center;font-size:8px;color:#a29784;margin:13px 0 0;width:100%;background:none;border:0;padding:0;min-height:15px}.free-button{text-decoration:underline;font-size:10px;padding:3px}.tip{display:flex;align-items:center;gap:11px;border-top:1px dashed #e0d7c7;margin-top:23px;padding-top:19px}.tip>span{color:#b6ab95;font-size:26px}.tip p{color:#a49780;font-size:9px;line-height:1.8;margin:0}.tip strong{font-weight:600}footer{text-align:center;font-size:8px;letter-spacing:1.3px;color:#aaa08b;margin-top:38px}footer>span{margin:0 8px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@keyframes pop{from{opacity:0;scale:.8}to{opacity:1;scale:1}}
@media(min-width:1200px){.club{padding-top:38px}.intro{margin-top:47px;margin-bottom:39px}}
@media(max-width:740px){.club{max-width:500px;padding:20px 20px max(20px,env(safe-area-inset-bottom))}.brand{font-size:14px;gap:7px}.brand-icon{width:28px;height:28px;line-height:27px}.sound-button{font-size:10px;padding:8px 10px}.intro{margin:29px 0 23px}.intro h1{font-size:29px;margin:9px 0 10px;letter-spacing:-1.5px}.intro .eyebrow{font-size:8px}.intro p{font-size:10px}.game-layout{display:flex;flex-direction:column;gap:22px}.studio{width:100%;border-radius:21px}.studio-top{padding:15px 19px 0}.stage{height:211px}.cat{height:206px;width:93%;left:3.5%}.speech{top:13px;font-size:9px;padding:6px 12px}.star-one{top:70px}.star-two{top:57px}.note-one{top:122px;left:8%}.note-two{top:120px;right:7%}.track{height:86px;margin:3px 18px 12px}.track-hint{top:16px}.feedback{top:14px}.pads{padding:0 18px;gap:12px}.pad{min-height:78px;border-radius:14px}.pad-caption{top:11px;left:14px}.pad strong{font-size:26px;margin-top:23px}.keycap{top:22px;right:12px}.studio-bottom{padding:14px 19px 15px;font-size:8px}.session{width:100%;padding:0}.session-heading,.session h2,.session-description,.tip{display:none}.scoreboard{display:grid;grid-template-columns:1fr 1.25fr;padding:13px 18px;border-radius:14px;position:relative;gap:13px}.score-main>span,.score-details span{font-size:9px}.score-main>strong{font-size:28px;line-height:1.25;margin-top:2px}.score-main small{font-size:10px}.score-details{margin:0;align-items:center}.score-details>div{gap:4px}.score-details strong{font-size:21px}.score-details>div+div{padding-left:14px}.progress{grid-column:1/-1;margin:0;height:3px}.best{font-size:9px;margin:11px 3px 13px}.best strong{font-size:10px}.start-button{min-height:49px;padding:13px 17px;font-size:12px}.free-note{font-size:9px;margin-top:11px}footer{font-size:7px;letter-spacing:.6px;margin-top:23px}}
@media(max-width:360px){.club{padding-left:14px;padding-right:14px}.intro p{font-size:9px}.stage{height:190px}.cat{height:187px}.studio-bottom{font-size:7px}.scoreboard{padding:12px 14px}.score-details>div+div{padding-left:8px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}
.song-picker{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0;margin:0 0 28px;border:0}.song-picker legend{font-size:11px;font-weight:800;margin-bottom:9px;color:#8d806c}.song-picker button{display:flex;align-items:center;gap:12px;text-align:left;border:1px solid #e3dac9;background:#fffdf7;padding:14px;border-radius:15px;min-height:67px}.song-picker button.selected{background:#f0e6d3;border-color:#b79c76;box-shadow:0 2px 0 #cbb48f}.song-picker strong{font-size:12px;display:block}.song-picker small{display:block;color:#988a73;font-size:9px;margin-top:4px}.song-icon{color:#b58b60;font-size:24px}.song-check{margin-left:auto;font-size:14px;color:#a38863}.playing-song{font-size:11px;font-weight:800;margin:12px 0 0}.playing-song span{font-size:9px;color:#9c8f79;font-weight:500}.club{padding-top:12px}@media(max-width:740px){.club{padding-top:10px}.intro{margin-top:22px}.song-picker{gap:7px;margin-bottom:18px}.song-picker button{padding:11px 6px;justify-content:center;text-align:center;min-height:68px;display:block}.song-picker strong{font-size:10px}.song-picker small,.song-check{display:none}.song-icon{display:block;font-size:19px;margin-bottom:5px}.playing-song{font-size:10px}}
.difficulty-picker{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;border:0;margin:0;padding:0}.difficulty-picker legend{font-size:11px;font-weight:800;color:#8d806c;margin-bottom:9px}.difficulty-picker button{border:1px solid #e3dac9;border-radius:12px;background:#fffdf7;min-height:54px;padding:10px;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:5px}.difficulty-picker strong{font-size:12px}.difficulty-picker small{font-size:10px;color:#988a73}.difficulty-picker button.selected{background:#544b3e;border-color:#544b3e;color:#fffaf1}.difficulty-picker button.selected small{color:#eee2cd}.difficulty-help{font-size:11px;color:#8d806c;margin:10px 0 24px;line-height:1.7}.difficulty-help span{display:block;font-size:9px;color:#a29784}.song-picker{margin-bottom:18px}.difficulty-normal .track{height:150px}.difficulty-hard .track{height:190px}@media(max-width:740px){.difficulty-picker button{display:block;text-align:center;padding:8px 4px}.difficulty-picker small{display:block;margin-top:4px;font-size:9px}.difficulty-help{font-size:10px;margin-bottom:18px}.difficulty-normal .track{height:140px}.difficulty-hard .track{height:180px}.song-picker .song-tempo{display:block;font-size:8px}}
.lane{width:20%;border-right:1px dashed #e2d7c5;background:linear-gradient(0deg,transparent,var(--pad-color));opacity:.16}.hit-line span{width:25px;height:23px}.beat{width:25px;height:25px;font-size:10px}.pads{grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}.pad{background:var(--pad-color);border-color:#00000015;border-bottom-color:#00000025;min-height:88px}.pad-caption{position:static;display:block;font-size:9px;margin-top:7px}.pad strong{margin:6px 0 4px;text-align:center;font-size:24px}.keycap{position:static;display:block;width:22px;height:20px;line-height:18px;margin:0 auto 6px;font-size:10px}.pad.unused{opacity:.48}.pad-guide{font-size:10px;color:#8d806c;margin:12px 0 0}.pad-guide span{display:block;font-size:9px;margin-top:5px;color:#a29784}@media(max-width:740px){.pads{gap:5px;padding:0 12px}.pad{min-height:80px;border-radius:10px;padding:0}.pad strong{font-size:21px}.pad-caption{font-size:8px}.track{margin-left:12px;margin-right:12px}.keycap{font-size:10px}.studio-bottom{font-size:8px;padding-left:13px;padding-right:13px}.beat{width:23px;height:23px;line-height:20px}.hit-line span{width:24px}.pad-guide{font-size:9px}}
.start-button:disabled{opacity:.6;cursor:wait}.audio-error{font-size:11px;line-height:1.6;color:#a55342}.music-credits{font-size:10px;line-height:1.7;color:#8d806c;margin-top:30px}.music-credits summary{cursor:pointer}.music-credits a{color:#786851}

.mobile-hud{display:none}
@media(max-width:740px){
  .club.round-focused{position:fixed;inset:0;z-index:10;max-width:none;width:100%;height:100vh;height:100dvh;padding:0;background:var(--paper);overflow:hidden}
  .round-focused>.topbar,.round-focused>.intro,.round-focused>.difficulty-picker,.round-focused>.difficulty-help,.round-focused>.song-picker,.round-focused>.music-credits,.round-focused>footer{display:none}
  .round-focused .game-layout{display:block;height:100%}
  .round-focused .session{display:none}
  .round-focused .studio{height:100%;display:flex;flex-direction:column;border:0;border-radius:0;box-shadow:none;padding:env(safe-area-inset-top) max(0px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(0px,env(safe-area-inset-left))}
  .round-focused .mobile-hud{display:flex;align-items:center;gap:4px;padding:6px 10px;min-height:58px;flex-shrink:0}
  .mobile-song{flex:1;min-width:0;padding-left:48px}
  .mobile-song strong,.mobile-song span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .mobile-song strong{font-size:11px}.mobile-song span{font-size:9px;color:#8d806c;margin-top:4px}
  .mobile-hud button{height:44px;min-width:44px;padding:0 7px;border:1px solid #e3dac9;border-radius:10px;background:#f2ede2;font-size:10px;font-weight:800}
  .mobile-hud button:disabled{opacity:.5}
  .round-focused .studio-top,.round-focused .studio-bottom{display:none}
  .round-focused .stage{position:absolute;z-index:1;top:calc(env(safe-area-inset-top) + 6px);left:7px;width:47px;height:44px;pointer-events:none;background:none}
  .round-focused .stage>span,.round-focused .speech{display:none}
  .round-focused .cat{width:100%;height:44px;left:0;bottom:0}
  .round-focused .track{flex:1;min-height:0;height:auto;margin:0 10px 8px;border-radius:12px}
  .round-focused .track-hint{top:20px;font-size:11px;padding:0 10px;line-height:1.7}
  .round-focused .feedback{top:44%;font-size:14px}
  .round-focused .pads{flex-shrink:0;padding:0 10px;gap:5px}
  .round-focused .pad{height:76px;min-height:76px}
}
@media(max-width:360px){.mobile-song{padding-left:0}.round-focused .stage{display:none}}
@media(max-width:740px) and (max-height:450px){
  .round-focused .mobile-hud{min-height:48px;padding-top:2px;padding-bottom:2px}
  .round-focused .pad{height:58px;min-height:58px}.round-focused .pad-caption{display:none}
  .round-focused .pad strong{font-size:19px;margin:4px 0 1px}.round-focused .keycap{margin-bottom:2px}
}
</style>
