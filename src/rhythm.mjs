import { SONGS, songTimeline } from './songs.mjs'

export const APPROACH_MS = 1200
export const HIT_WINDOW = 180

export function createNotes(song = SONGS[0]) {
  return songTimeline(song).melody.map(({ id, time }) => ({
    id, side: id % 2, time, hit: false, missed: false,
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
