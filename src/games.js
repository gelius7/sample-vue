import BongoGame from './components/BongoGame.vue'
import WatermelonGame from './components/WatermelonGame.vue'

// Add a component and one card here to introduce another independent mini-game.
// Games own their state and clean up audio, listeners, and animation on unmount.
export const games = [
  { id: 'bongo', title: '냥냥 리듬 클럽', subtitle: '고양이와 동요 한 곡', description: '반짝반짝 작은 별부터 프레르 자크까지. 익숙한 멜로디에 두 앞발을 맞춰 봐요.', tag: '리듬 · 동요 3곡', color: 'peach', icon: '♬', component: BongoGame },
  { id: 'watermelon', title: '수박 만들기', subtitle: '작은 과일이 커다란 수박으로', description: '같은 과일끼리 만나면 한 단계 더 크게! 통이 가득 차기 전에 수박을 만들어 봐요.', tag: '합치기 · 차근차근', color: 'green', icon: '◒', component: WatermelonGame },
]
