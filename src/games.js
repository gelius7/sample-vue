import BongoGame from './components/BongoGame.vue'
import WatermelonGame from './components/WatermelonGame.vue'

// Add a component and one card here to introduce another independent mini-game.
// Games own their state and clean up audio, listeners, and animation on unmount.
export const games = [
  { id: 'bongo', title: '냥냥 리듬 클럽', subtitle: '고양이와 멜로디 열두 곡', description: '쉬운 동요부터 빠른 클래식까지. 다섯 버튼으로 동요, 클래식, 일렉트로닉 열두 곡에 도전해요.', tag: '리듬 · 12곡 · 다섯 버튼', color: 'peach', icon: '♬', component: BongoGame },
  { id: 'watermelon', title: '수박 만들기', subtitle: '작은 과일이 커다란 수박으로', description: '같은 과일끼리 만나면 한 단계 더 크게! 통이 가득 차기 전에 수박을 만들어 봐요.', tag: '합치기 · 차근차근', color: 'green', icon: '◒', component: WatermelonGame },
]
