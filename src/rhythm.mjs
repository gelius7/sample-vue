/* eslint-env es6 */
import { LEAD_IN_MS, SONGS, songTimeline } from './songs.mjs'

// Difficulty belongs to the song, not to a stricter scoring rule.
export const HIT_WINDOW = 150
export const PERFECT_WINDOW = 70
export const APPROACH_MS = 1200
export const DIFFICULTIES = [
  { id: 'easy', title: '쉬움', subtitle: '차근차근', description: '익숙한 동요 · 여유로운 박자와 짧은 연타' },
  { id: 'normal', title: '보통', subtitle: '리듬 변화', description: '다채로운 멜로디 · 긴 음, 짧은 음, 쉼표를 따라' },
  { id: 'hard', title: '어려움', subtitle: '빠른 도전', description: '빠른 리듬 · 촘촘한 음표와 엇박, 교차 연타' },
]

export function createNotes(song = SONGS[0], leadInMs = LEAD_IN_MS) {
  const melody = songTimeline(song, leadInMs).targets
  const lanes = song.lanes || [0, 1, 2, 3, 4]
  const pitches = [...new Set(melody.map(note => note.midi).filter(Number.isFinite))].sort((a, b) => a - b)
  const lastLane = Array(lanes.length).fill(-Infinity)
  const notes = []
  for (const [id, note] of melody.entries()) {
    const previous = notes[id - 1]
    const previousLane = previous ? lanes.indexOf(previous.side) : -1
    const direction = previous ? Math.sign(note.midi - melody[id - 1].midi) : 0
    // Low pitches sit on the left, high pitches on the right. The smaller
    // nursery layouts group pitches; fuller layouts also preserve small turns.
    let lane = note.side === undefined
      ? Math.round(Math.max(0, pitches.indexOf(note.midi)) * (lanes.length - 1) / Math.max(1, pitches.length - 1))
      : lanes.indexOf(note.side)
    if (note.midi !== undefined && previous) {
      if (direction === 0 && note.time - previous.time >= 220) lane = previousLane
      else if (direction !== 0 && lanes.length >= 4 && direction * (lane - previousLane) <= 0) {
        lane = Math.max(0, Math.min(lanes.length - 1, previousLane + direction))
      }
    }
    // Keep every onset. Fast repeats borrow the nearest available pad instead
    // of making an unfair same-pad jack or marching around all five pads.
    const available = lanes.map((_, index) => index).filter(index => note.time - lastLane[index] >= 220)
    available.sort((a, b) => Math.abs(a - lane) - Math.abs(b - lane) || (direction || 1) * (b - a))
    lane = available[0]
    lastLane[lane] = note.time
    notes.push({ id, side: lanes[lane], time: note.time, hit: false, missed: false })
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
