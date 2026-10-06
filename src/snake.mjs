export const SIZE = 16
export const DIRECTIONS = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] }
const same = (a, b) => a.x === b.x && a.y === b.y

export function placeFood(snake, random = Math.random) {
  const empty = []
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    if (!snake.some(cell => cell.x === x && cell.y === y)) empty.push({ x, y })
  }
  return empty.length ? empty[Math.floor(random() * empty.length)] : null
}
export function createGame(random = Math.random) {
  const snake = [{ x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }]
  return { snake, direction: 'right', queued: null, food: placeFood(snake, random), score: 0, status: 'playing' }
}
export function turn(game, direction) {
  if (game.status !== 'playing' || game.queued || !DIRECTIONS[direction]) return
  const [dx, dy] = DIRECTIONS[game.direction], [nx, ny] = DIRECTIONS[direction]
  if ((dx === -nx && dy === -ny) || direction === game.direction) return
  game.queued = direction // One turn per tick prevents rapid input from reversing into the neck.
}
export function tick(game, random = Math.random) {
  if (game.status !== 'playing') return
  game.direction = game.queued || game.direction
  game.queued = null
  const [dx, dy] = DIRECTIONS[game.direction]
  const head = { x: game.snake[0].x + dx, y: game.snake[0].y + dy }
  const growing = game.food && same(head, game.food)
  const body = growing ? game.snake : game.snake.slice(0, -1)
  if (head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE || body.some(cell => same(cell, head))) {
    game.status = 'over'
    return
  }
  game.snake.unshift(head)
  if (!growing) game.snake.pop()
  else {
    game.score += 10
    game.food = placeFood(game.snake, random)
    if (!game.food) game.status = 'won'
  }
}
