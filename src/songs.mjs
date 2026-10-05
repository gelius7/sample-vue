// Historic melodies only. No modern arrangements, lyrics, or sampled recordings.
// Source references and original synthesis details are documented in README.md.
const melody = (pitches, durations) => pitches.split(' ').map((pitch, i) => ({ midi: Number(pitch), beats: durations[i] }))
const twinklePhrase = [1, 1, 1, 1, 1, 1, 2]
const twinkle = melody('60 60 67 67 69 69 67 65 65 64 64 62 62 60 67 67 65 65 64 64 62 67 67 65 65 64 64 62 60 60 67 67 69 69 67 65 65 64 64 62 62 60', Array(6).fill(twinklePhrase).flat())
const jacques = melody('60 62 64 60 60 62 64 60 64 65 67 64 65 67 67 69 67 65 64 60 67 69 67 65 64 60 60 55 60 60 55 60', [1,1,1,1,1,1,1,1,1,1,2,1,1,2,.5,.5,.5,.5,1,1,.5,.5,.5,.5,1,1,1,1,2,1,1,2])
const mary = melody('64 62 60 62 64 64 64 62 62 62 64 64 64 64 62 60 62 64 64 64 64 62 62 64 62 60', [1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,4])

export const SONGS = [
  { id: 'twinkle', title: '반짝반짝 작은 별', subtitle: 'Twinkle, Twinkle, Little Star', icon: '✦', bpm: 104, melody: twinkle },
  { id: 'jacques', title: '프레르 자크', subtitle: 'Frère Jacques', icon: '♬', bpm: 112, melody: [...jacques, ...jacques] },
  { id: 'mary', title: '메리의 작은 양', subtitle: 'Mary Had a Little Lamb', icon: '♡', bpm: 116, melody: [...mary, ...mary] },
]

export const LEAD_IN_MS = 1400
export function songTimeline(song) {
  let time = LEAD_IN_MS
  const melody = song.melody.map((note, id) => {
    const duration = note.beats * 60000 / song.bpm
    const event = { ...note, id, time: Math.round(time), duration }
    time += duration
    return event
  })
  const bass = []
  // A quiet, original C-major accompaniment. Melody and chart use this same clock.
  for (let beat = 0; LEAD_IN_MS + beat * 60000 / song.bpm < time - 1; beat += 4) {
    bass.push({ midi: 48, time: LEAD_IN_MS + beat * 60000 / song.bpm, duration: 2 * 60000 / song.bpm })
  }
  return { melody, bass, duration: time + 700 }
}
