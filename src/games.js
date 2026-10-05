import BongoGame from './components/BongoGame.vue'
import WatermelonGame from './components/WatermelonGame.vue'
import TetrisGame from './components/TetrisGame.vue'

// Add a component and one card here to introduce another independent mini-game.
// Games own their state and clean up audio, listeners, and animation on unmount.
export const games = [
  { id: 'bongo', title: '냥냥 리듬 클럽', subtitle: '고양이와 멜로디 열두 곡', description: '쉬운 동요부터 빠른 클래식까지. 다섯 버튼으로 동요, 클래식, 일렉트로닉 열두 곡에 도전해요.', tag: '리듬 · 12곡 · 다섯 버튼', color: 'peach', icon: '♬', component: BongoGame },
  { id: 'watermelon', title: '수박 만들기', subtitle: '작은 과일이 커다란 수박으로', description: '같은 과일끼리 만나면 한 단계 더 크게! 통이 가득 차기 전에 수박을 만들어 봐요.', tag: '합치기 · 차근차근', color: 'green', icon: '◒', component: WatermelonGame },
  { id: 'tetris', title: '테트리스 40라인', subtitle: '한 줄씩, 차곡차곡', description: '일곱 가지 블록으로 빈틈없이 채워요. 위까지 쌓이기 전에 40라인을 지우고 성공 시간을 확인해요.', tag: '블록 · 40라인 도전', color: 'lavender', icon: '▥', component: TetrisGame },
]
