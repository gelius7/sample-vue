export const COLUMNS = 10
export const ROWS = 20
export const TARGET_LINES = 40
export const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
}
const emptyRow = () => Array(COLUMNS).fill(null)

export function createGame(random = Math.random) {
  const game = { board: Array.from({ length: ROWS }, emptyRow), piece: null, bag: [], random, lines: 0, elapsedMs: 0, fallMs: 0, status: 'playing' }
  spawn(game)
  return game
}
function spawn(game) {
  if (!game.bag.length) {
    game.bag = Object.keys(SHAPES)
    for (let i = game.bag.length - 1; i > 0; i--) {
      const j = Math.floor(game.random() * (i + 1))
      ;[game.bag[i], game.bag[j]] = [game.bag[j], game.bag[i]]
    }
  }
  const type = game.bag.pop(), cells = SHAPES[type].map(row => [...row])
  game.piece = { type, cells, x: Math.floor((COLUMNS - cells[0].length) / 2), y: 0 }
  game.fallMs = 0
  if (!fits(game, game.piece)) game.status = 'over'
}
export function fits(game, piece) {
  return piece.cells.every((row, dy) => row.every((filled, dx) => {
    const x = piece.x + dx, y = piece.y + dy
    return !filled || (x >= 0 && x < COLUMNS && y >= 0 && y < ROWS && !game.board[y][x])
  }))
}
function lock(game) {
  const { piece } = game
  piece.cells.forEach((row, dy) => row.forEach((filled, dx) => {
    if (filled) game.board[piece.y + dy][piece.x + dx] = piece.type
  }))
  const remaining = game.board.filter(row => row.some(cell => !cell))
  game.lines = Math.min(TARGET_LINES, game.lines + ROWS - remaining.length)
  game.board = [...Array.from({ length: ROWS - remaining.length }, emptyRow), ...remaining]
  if (game.lines >= TARGET_LINES) {
    game.piece = null
    game.status = 'won'
  } else spawn(game)
}
export function move(game, dx, dy = 0) {
  if (game.status !== 'playing') return false
  const candidate = { ...game.piece, x: game.piece.x + dx, y: game.piece.y + dy }
  if (fits(game, candidate)) { game.piece = candidate; return true }
  if (dy > 0) lock(game)
  return false
}
export function rotate(game) {
  if (game.status !== 'playing') return false
  const { piece } = game
  const cells = piece.cells[0].map((_, x) => piece.cells.map(row => row[x]).reverse())
  // Small horizontal wall kicks keep this basic rotation usable near either edge.
  for (const dx of [0, -1, 1, -2, 2, -3, 3]) {
    const candidate = { ...piece, cells, x: piece.x + dx }
    if (fits(game, candidate)) { game.piece = candidate; return true }
  }
  return false
}
export function hardDrop(game) {
  if (game.status !== 'playing') return
  while (fits(game, { ...game.piece, y: game.piece.y + 1 })) game.piece.y++
  lock(game)
}
export function tick(game, deltaMs) {
  if (game.status !== 'playing') return
  game.elapsedMs += Math.max(0, deltaMs)
  game.fallMs += Math.max(0, deltaMs)
  const interval = Math.max(350, 700 - Math.floor(game.lines / 10) * 100)
  while (game.fallMs >= interval && game.status === 'playing') {
    game.fallMs -= interval
    move(game, 0, 1)
  }
}
export function formatTime(ms) {
  const tenths = Math.floor(ms / 100)
  return `${Math.floor(tenths / 600)}:${String(Math.floor(tenths / 10) % 60).padStart(2, '0')}.${tenths % 10}`
}
