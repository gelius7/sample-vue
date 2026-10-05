export const ROUND_MS = 30000
export const APPROACH_MS = 1200
export const HIT_WINDOW = 180

export function createNotes() {
  const pattern = [0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1]
  return Array.from({ length: 48 }, (_, id) => ({
    id, side: pattern[id % pattern.length], time: 1200 + id * 600, hit: false, missed: false,
  }))
}

export function judgeHit(notes, side, elapsed) {
  const note = notes.find(n => !n.hit && !n.missed && n.side === side && Math.abs(n.time - elapsed) <= HIT_WINDOW)
  if (!note) return null
  note.hit = true
  return { perfect: Math.abs(note.time - elapsed) <= 80 }
}

export function expireNotes(notes, elapsed) {
  let missed = 0
  for (const note of notes) {
    if (!note.hit && !note.missed && elapsed - note.time > HIT_WINDOW) {
      note.missed = true
      missed++
    }
  }
  return missed
}
