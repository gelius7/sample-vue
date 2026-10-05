<template>
  <div class="arcade">
    <nav class="arcade-nav" aria-label="게임 이동">
      <button class="arcade-brand" @click="goHome">PLAY A LITTLE <span>✳</span></button>
      <button v-if="currentGame" class="back-button" @click="goHome">← 게임 고르기</button>
      <span v-else class="arcade-note">잠깐 놀아도 괜찮아</span>
    </nav>
    <component :is="currentGame.component" v-if="currentGame" :key="currentGame.id" />
    <main v-else class="game-home">
      <div class="home-intro">
        <span class="home-eyebrow">A POCKETFUL OF HAPPY</span>
        <h1>오늘은 <span>뭐 하고 놀까요?</span></h1>
        <p>가볍게 한 판, 기분 좋은 쉬는 시간.</p>
      </div>
      <div class="game-cards">
        <button v-for="game in games" :key="game.id" class="game-card" :class="game.color" @click="openGame(game.id)">
          <div class="card-art" aria-hidden="true">
            <svg v-if="game.id === 'bongo'" viewBox="0 0 300 170"><path d="M87 135V77L78 24l43 24q30-12 60 0l43-24-9 54v57" fill="#fffaf0" stroke="#605443" stroke-width="3" stroke-linejoin="round"/><path d="m88 38 6 32 18-17m102-15-6 32-18-17" fill="#f1baa3"/><path d="m121 88 10-7 10 7m21 0 10-7 10 7m-41 11q10 15 20 0" fill="none" stroke="#605443" stroke-width="3" stroke-linecap="round"/><ellipse cx="103" cy="137" rx="51" ry="20" fill="#efa889" stroke="#605443" stroke-width="3"/><ellipse cx="198" cy="137" rx="51" ry="20" fill="#beaddb" stroke="#605443" stroke-width="3"/><path d="M117 116q-25-20-28 4m95-4q25-20 28 4" fill="none" stroke="#605443" stroke-width="14" stroke-linecap="round"/><path d="M117 116q-25-20-28 4m95-4q25-20 28 4" fill="none" stroke="#fffaf0" stroke-width="9" stroke-linecap="round"/><text x="40" y="72" fill="#b88865" font-size="32">♪</text><text x="244" y="91" fill="#a18cbc" font-size="30">♫</text></svg>
            <svg v-else-if="game.id === 'watermelon'" viewBox="0 0 300 170"><circle cx="155" cy="89" r="68" fill="#8fb78f" stroke="#4c7851" stroke-width="3"/><path d="M129 25q-39 68 0 128m25-135q-35 75 0 143m24-137q29 68 0 129" fill="none" stroke="#65976c" stroke-width="12"/><circle cx="137" cy="93" r="4" fill="#344b34"/><circle cx="176" cy="93" r="4" fill="#344b34"/><path d="M145 107q12 10 23 0" fill="none" stroke="#344b34" stroke-width="3" stroke-linecap="round"/><circle cx="70" cy="126" r="27" fill="#edbe78"/><path d="M69 99q-2-15 13-11" fill="none" stroke="#6e925b" stroke-width="5"/><circle cx="231" cy="133" r="21" fill="#d97e76"/><path d="M231 112q-4-11 9-14" fill="none" stroke="#6e925b" stroke-width="4"/><circle cx="63" cy="127" r="2.5" fill="#765e43"/><circle cx="77" cy="127" r="2.5" fill="#765e43"/></svg><svg v-else-if="game.id === 'tetris'" viewBox="0 0 300 170"><g stroke="#fffdf7" stroke-width="3" stroke-linejoin="round"><path d="M61 125h36v-36h36v36h36v36H61Z" fill="#b49dcc"/><path d="M169 125h36V89h36v72h-72Z" fill="#e5ad7f"/><path d="M61 53h36v72H25V89h36Z" fill="#99b78b"/><path d="M133 17h36v36h36v36H97V53h36Z" fill="#8b9fc4"/><path d="M217 24h36v36h-36Z" fill="#e9c577"/></g></svg><span v-else class="card-generic">{{ game.icon }}</span>
          </div>
          <div class="card-copy"><span class="game-tag">{{ game.tag }}</span><h2>{{ game.title }}</h2><strong>{{ game.subtitle }}</strong><p>{{ game.description }}</p><span class="play-link">놀러 가기 <span>→</span></span></div>
        </button>
      </div>
      <p class="home-bottom">손가락으로 톡. 키보드로도 편하게. <span>♡</span></p>
    </main>
  </div>
</template>

<script setup>
/* eslint-env browser */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { games } from './games'
const selected = ref(window.location.hash.slice(1))
const currentGame = computed(() => games.find(game => game.id === selected.value))
function updateRoute() { selected.value = window.location.hash.slice(1); window.scrollTo(0, 0) }
function openGame(id) { window.location.hash = id }
function goHome() { window.location.hash = '' }
onMounted(() => window.addEventListener('hashchange', updateRoute))
onUnmounted(() => window.removeEventListener('hashchange', updateRoute))
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900;1000&family=Noto+Sans+KR:wght@400;500;600;700;800;900&display=swap');
:root{color-scheme:light;--ink:#443c33;--muted:#8d877b;--paper:#fbf7ed;--peach:#efa789;--purple:#b5a3d5}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:'Nunito','Noto Sans KR',sans-serif;-webkit-font-smoothing:antialiased}button,a{-webkit-tap-highlight-color:transparent}button{font:inherit;cursor:pointer;color:inherit;touch-action:manipulation}button:focus-visible,a:focus-visible{outline:3px solid #7660a1;outline-offset:5px}a{color:inherit;text-decoration:none}
.arcade-nav{max-width:1120px;margin:auto;padding:24px 48px 10px;display:flex;justify-content:space-between;align-items:center;gap:15px}.arcade-brand{border:0;background:none;padding:8px 0;font-size:11px;letter-spacing:2px;font-weight:1000}.arcade-brand span{color:#9daa7e;margin-left:6px;font-size:18px}.back-button{background:#eee8db;border:1px solid #ded5c3;border-radius:20px;padding:9px 13px;font-size:11px;font-weight:700}.arcade-note{font-size:10px;color:#9c907c}.game-home{max-width:1030px;margin:auto;padding:0 48px 32px}.home-intro{text-align:center;margin:62px 0 39px}.home-eyebrow{font-size:10px;letter-spacing:3px;color:#a4937d;font-weight:900}.home-intro h1{font-size:37px;letter-spacing:-1.9px;line-height:1.45;margin:12px 0}.home-intro h1 span{color:#ae8164}.home-intro p{font-size:13px;color:#928777}.game-cards{display:grid;grid-template-columns:1fr 1fr;gap:24px}.game-card{text-align:left;border:1px solid #e5dcca;background:#fffdf7;border-radius:25px;padding:0;overflow:hidden;box-shadow:0 7px 0 #eee7d9;transition:transform .15s}.game-card:hover{transform:translateY(-4px)}.card-art{height:206px;padding:20px;background:#f5e5d2}.green .card-art{background:#e5edda}.lavender .card-art{background:#eee5f3}.card-art svg{display:block;width:100%;height:100%;max-width:350px;margin:auto}.card-generic{display:block;text-align:center;font-size:100px;line-height:166px;color:#a28d6b}.card-copy{padding:25px 28px 22px}.game-tag{font-size:10px;color:#a18a69;letter-spacing:.5px}.green .game-tag{color:#81926b}.lavender .game-tag{color:#9b84b2}.card-copy h2{font-size:26px;margin:9px 0 12px;letter-spacing:-1px}.card-copy>strong{font-size:12px;font-weight:600;color:#8c7c66}.card-copy p{font-size:11px;line-height:1.9;color:#9d907d;min-height:43px;word-break:keep-all;margin:9px 0 25px}.play-link{border-top:1px solid #eee6d7;padding-top:15px;display:flex;justify-content:space-between;font-size:12px;font-weight:800}.play-link>span{color:#b18a65;font-size:20px;line-height:15px}.home-bottom{text-align:center;font-size:10px;color:#a59984;margin-top:38px}.home-bottom>span{color:#c4a68b;margin-left:8px}@media(max-width:740px){.arcade-nav{padding:15px 20px 8px}.arcade-brand{font-size:9px;letter-spacing:1.5px}.arcade-note{font-size:9px}.back-button{font-size:10px}.game-home{padding:0 20px 28px;max-width:500px}.home-intro{margin:30px 0}.home-eyebrow{font-size:8px;letter-spacing:2px}.home-intro h1{font-size:26px;letter-spacing:-1.3px}.home-intro p{font-size:11px}.game-cards{grid-template-columns:1fr;gap:22px}.card-art{height:172px;padding:15px}.card-generic{display:block;text-align:center;font-size:100px;line-height:166px;color:#a28d6b}.card-copy{padding:20px 22px}.card-copy h2{font-size:23px}.card-copy p{min-height:0;margin-bottom:20px}.home-bottom{font-size:9px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}
</style>
