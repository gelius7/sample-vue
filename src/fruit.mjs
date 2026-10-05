/* eslint-env es6 */
export const WIDTH = 360
export const HEIGHT = 480
export const DANGER_Y = 82
export const DROP_Y = 42
export const STEP = 1 / 120
export const FRUITS = [
  { name: '체리', radius: 13, color: '#e87985', shade: '#bd5368', points: 1 },
  { name: '딸기', radius: 18, color: '#f48b83', shade: '#cd6465', points: 3 },
  { name: '포도', radius: 23, color: '#b29bcc', shade: '#85709d', points: 6 },
  { name: '살구', radius: 28, color: '#f8c178', shade: '#d79551', points: 10 },
  { name: '귤', radius: 34, color: '#f4a65b', shade: '#cc8040', points: 15 },
  { name: '사과', radius: 40, color: '#ed8580', shade: '#c76362', points: 21 },
  { name: '배', radius: 47, color: '#d4ca83', shade: '#a99c54', points: 28 },
  { name: '복숭아', radius: 54, color: '#f4b7b0', shade: '#d68e91', points: 36 },
  { name: '파인애플', radius: 62, color: '#ecd279', shade: '#bfa356', points: 45 },
  { name: '멜론', radius: 70, color: '#b4cc8e', shade: '#849e63', points: 55 },
  { name: '수박', radius: 80, color: '#7bae83', shade: '#4c835e', points: 66 },
]

export function createWorld() {
  return { fruits: [], score: 0, largest: 0, nextId: 1, time: 0, over: false }
}

export function dropFruit(world, level, x) {
  if (world.over) return null
  const radius = FRUITS[level].radius
  const fruit = {
    id: world.nextId++, level, radius,
    x: Math.max(radius + 6, Math.min(WIDTH - radius - 6, x)), y: DROP_Y,
    vx: 0, vy: 0, age: 0, overflow: 0,
  }
  world.fruits.push(fruit)
  world.largest = Math.max(world.largest, level)
  return fruit
}

function contain(fruit) {
  if (fruit.x < fruit.radius + 6) {
    fruit.x = fruit.radius + 6
    fruit.vx = Math.max(0, fruit.vx) * 0.2
  }
  if (fruit.x > WIDTH - fruit.radius - 6) {
    fruit.x = WIDTH - fruit.radius - 6
    fruit.vx = Math.min(0, fruit.vx) * 0.2
  }
  if (fruit.y > HEIGHT - fruit.radius - 8) {
    fruit.y = HEIGHT - fruit.radius - 8
    fruit.vy = Math.min(0, fruit.vy) * 0.08
    fruit.vx *= 0.97
  }
}

// ponytail: quadratic contacts are enough for this small jar; use a spatial grid only for much larger boards.
export function stepWorld(world, dt = STEP) {
  if (world.over) return []
  world.time += dt
  const merges = []
  for (const fruit of world.fruits) {
    fruit.age += dt
    fruit.vy += 780 * dt
    fruit.vx *= Math.exp(-0.6 * dt)
    fruit.x += fruit.vx * dt
    fruit.y += fruit.vy * dt
    contain(fruit)
  }
  for (let pass = 0; pass < 4; pass++) {
    const removed = new Set()
    const added = []
    for (let i = 0; i < world.fruits.length; i++) {
      const a = world.fruits[i]
      if (removed.has(a.id)) continue
      for (let j = i + 1; j < world.fruits.length; j++) {
        const b = world.fruits[j]
        if (removed.has(b.id)) continue
        let dx = b.x - a.x
        let dy = b.y - a.y
        let distance = Math.hypot(dx, dy)
        const overlap = a.radius + b.radius - distance
        if (overlap <= 0) continue
        if (a.level === b.level && a.level < FRUITS.length - 1) {
          const level = a.level + 1
          const fruit = {
            id: world.nextId++, level, radius: FRUITS[level].radius,
            x: (a.x + b.x) / 2, y: (a.y + b.y) / 2,
            vx: (a.vx + b.vx) / 2, vy: (a.vy + b.vy) / 2,
            age: 0, overflow: 0,
          }
          contain(fruit)
          removed.add(a.id)
          removed.add(b.id)
          added.push(fruit)
          world.score += FRUITS[level].points
          world.largest = Math.max(world.largest, level)
          merges.push({ x: fruit.x, y: fruit.y, level, points: FRUITS[level].points })
          break
        }
        if (!distance) { dx = 1; dy = 0; distance = 1 }
        const nx = dx / distance
        const ny = dy / distance
        const massA = a.radius * a.radius
        const massB = b.radius * b.radius
        const shareA = massB / (massA + massB)
        const shareB = 1 - shareA
        a.x -= nx * overlap * shareA
        a.y -= ny * overlap * shareA
        b.x += nx * overlap * shareB
        b.y += ny * overlap * shareB
        const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
        if (relative < 0) {
          const impulse = -relative * 1.08
          a.vx -= impulse * nx * shareA
          a.vy -= impulse * ny * shareA
          b.vx += impulse * nx * shareB
          b.vy += impulse * ny * shareB
          const tangent = (b.vx - a.vx) * -ny + (b.vy - a.vy) * nx
          a.vx += tangent * -ny * shareA * 0.08
          a.vy += tangent * nx * shareA * 0.08
          b.vx -= tangent * -ny * shareB * 0.08
          b.vy -= tangent * nx * shareB * 0.08
        }
        contain(a)
        contain(b)
      }
    }
    if (removed.size) world.fruits = world.fruits.filter(fruit => !removed.has(fruit.id)).concat(added)
  }
  for (const fruit of world.fruits) {
    // A new drop or a growing merge gets time to settle before the rim counts.
    fruit.overflow = fruit.age > 1.5 && fruit.y - fruit.radius < DANGER_Y
      ? fruit.overflow + dt : 0
    if (fruit.overflow > 1.2) world.over = true
  }
  return merges
}
