import { SONGS, songTimeline } from './songs.mjs'

// Difficulty belongs to the song, not to a stricter scoring rule.
export const HIT_WINDOW = 150
export const PERFECT_WINDOW = 70
export const APPROACH_MS = 1200
export const DIFFICULTIES = [
  { id: 'easy', title: '쉬움', subtitle: '차근차근', description: '익숙한 동요 · 여유로운 박자와 짧은 연타' },
  { id: 'normal', title: '보통', subtitle: '리듬 변화', description: '다채로운 멜로디 · 긴 음, 짧은 음, 쉼표를 따라' },
  { id: 'hard', title: '어려움', subtitle: '빠른 도전', description: '빠른 리듬 · 촘촘한 음표와 엇박, 교차 연타' },
]

export function createNotes(song = SONGS[0]) {
  const melody = songTimeline(song).targets
  const notes = []
  for (const [id, note] of melody.entries()) {
    const previous = notes[id - 1]
    // Repeated pitches may repeat a pad; quick runs move across the available pads.
    // A long rest starts a fresh phrase. No generated filler beats.
    const lanes = song.lanes || [0, 1, 2, 3, 4]
    let side = previous ? lanes[(lanes.indexOf(previous.side) + 1) % lanes.length] : lanes[0]
    if (previous && note.time - previous.time > 900) side = lanes[0]
    else if (song.difficulty !== 'easy' && previous && note.midi !== undefined && note.midi === melody[id - 1].midi && note.time - previous.time >= 300 && (id < 2 || notes[id - 2].side !== previous.side)) side = previous.side
    notes.push({ id, side, time: note.time, hit: false, missed: false })
  }
  return notes
}

export function judgeHit(notes, side, elapsed) {
  let nearest
  for (const note of notes) {
    if (note.hit || note.missed || note.side !== side || Math.abs(note.time - elapsed) > HIT_WINDOW) continue
    if (!nearest || Math.abs(note.time - elapsed) < Math.abs(nearest.time - elapsed)) nearest = note
  }
  if (!nearest) return null
  nearest.hit = true
  return { perfect: Math.abs(nearest.time - elapsed) <= PERFECT_WINDOW }
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
