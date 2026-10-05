import { SONGS, songTimeline, LEAD_IN_MS } from './songs.mjs'

export const DIFFICULTIES = [
  { id: 'easy', title: '쉬움', subtitle: '천천히 톡톡', description: '넉넉한 간격 · 왼쪽, 오른쪽 번갈아 · 너그러운 판정', hitWindow: 220, perfectWindow: 110, approach: 1400 },
  { id: 'normal', title: '보통', subtitle: '멜로디 그대로', description: '모든 멜로디 음 · 같은 손 두 번도 등장 · 정확하게 톡!', hitWindow: 150, perfectWindow: 70, approach: 1200 },
  { id: 'hard', title: '어려움', subtitle: '촘촘한 도전', description: '반 박자마다 톡톡 · 연타와 엇갈림 · 정교한 타이밍', hitWindow: 100, perfectWindow: 45, approach: 1000 },
]

export function createNotes(song = SONGS[0], difficulty = DIFFICULTIES[1]) {
  const timeline = songTimeline(song)
  const beat = 60000 / song.bpm
  let times = timeline.melody.map(note => note.time)
  if (difficulty.id === 'easy') {
    let last = -Infinity
    times = times.filter(time => {
      if (time - last < beat * 1.5 - 1) return false
      last = time
      return true
    })
  } else if (difficulty.id === 'hard') {
    // All melodies use whole/half beats: a single rounded grid avoids near-duplicates.
    const end = timeline.duration - 700
    for (let i = 0; LEAD_IN_MS + i * beat / 2 < end - 1; i++) times.push(Math.round(LEAD_IN_MS + i * beat / 2))
    times = [...new Set(times)].sort((a, b) => a - b)
  }
  const pattern = difficulty.id === 'easy' ? [0, 1] : difficulty.id === 'normal' ? [0, 0, 1, 0, 1, 1, 0, 1] : [0, 1, 0, 0, 1, 0, 1, 1]
  return times.map((time, id) => ({ id, side: pattern[id % pattern.length], time, hit: false, missed: false }))
}

export function judgeHit(notes, side, elapsed, difficulty = DIFFICULTIES[1]) {
  const note = notes.find(n => !n.hit && !n.missed && n.side === side && Math.abs(n.time - elapsed) <= difficulty.hitWindow)
  if (!note) return null
  note.hit = true
  return { perfect: Math.abs(note.time - elapsed) <= difficulty.perfectWindow }
}

export function expireNotes(notes, elapsed, difficulty = DIFFICULTIES[1]) {
  let missed = 0
  for (const note of notes) {
    if (!note.hit && !note.missed && elapsed - note.time > difficulty.hitWindow) {
      note.missed = true
      missed++
    }
  }
  return missed
}
