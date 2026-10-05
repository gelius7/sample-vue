import { RECORDED_SONGS } from './recorded-songs.mjs'

// Historic melodies only. No modern arrangements, lyrics, or sampled recordings.
// Source references and original synthesis details are documented in README.md.
const melody = (pitches, durations) => pitches.split(' ').map((pitch, i) => ({ midi: Number(pitch), beats: durations[i] }))
const twinklePhrase = [1, 1, 1, 1, 1, 1, 2]
const twinkle = melody('60 60 67 67 69 69 67 65 65 64 64 62 62 60 67 67 65 65 64 64 62 67 67 65 65 64 64 62 60 60 67 67 69 69 67 65 65 64 64 62 62 60', Array(6).fill(twinklePhrase).flat())
const jacques = melody('60 62 64 60 60 62 64 60 64 65 67 64 65 67 67 69 67 65 64 60 67 69 67 65 64 60 60 55 60 60 55 60', [1,1,1,1,1,1,1,1,1,1,2,1,1,2,.5,.5,.5,.5,1,1,.5,.5,.5,.5,1,1,1,1,2,1,1,2])
const mary = melody('64 62 60 62 64 64 64 62 62 62 64 64 64 64 62 60 62 64 64 64 64 62 62 64 62 60', [1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,4])


// Short, newly programmed lead-line excerpts; numbers are MIDI pitches / quarter-note beats.
// A dash is a real rest: it advances the shared audio/chart clock without a target.
const phrase = text => text.trim().split(/\s+/).map(token => {
  const [pitch, beats = '1'] = token.split('/')
  return { midi: pitch === '-' ? null : Number(pitch), beats: Number(beats) }
})
const ode = phrase(`64 64 65 67 67 65 64 62 60 60 62 64 64/1.5 62/.5 62/2
  64 64 65 67 67 65 64 62 60 60 62 64 62/1.5 60/.5 60/2`)
const elise = phrase(`76/.5 75/.5 76/.5 75/.5 76/.5 71/.5 74/.5 72/.5 69/1.5
  60/.5 64/.5 69/.5 71/1.5 64/.5 68/.5 71/.5 72/1.5 64/.5
  76/.5 75/.5 76/.5 75/.5 76/.5 71/.5 74/.5 72/.5 69/1.5
  60/.5 64/.5 69/.5 71/1.5 64/.5 72/.5 71/.5 69/1.5 -/1.5`)

const springA = phrase('80/.5 80/.5 80/.5 78/.25 76/.25 83/1.5 83/.25 81/.25')
const springB = phrase('80/.5 81/.25 83/.25 81/.5 80/.5 78/.5 75/.5 71/.5 76/.5')
const springC = phrase('83/.5 81/.25 80/.25 81/.5 83/.5 85/.5 83 76/.5')
const spring = [...phrase('76/.5'), ...springA, ...springA, ...springB, ...springA, ...springA,
  ...phrase('80/.5 81/.25 83/.25 81/.5 80/.5 78 -/.5 76/.5'), ...springC, ...springC,
  ...phrase('85/.5 83 81/.5 80/.5 78/.25 76/.25 78 76 -/.5')]

const turkish = phrase(`71/.25 69/.25 68/.25 69/.25
  72/.5 -/.5 74/.25 72/.25 71/.25 72/.25
  76/.5 -/.5 77/.25 76/.25 75/.25 76/.25
  83/.25 81/.25 80/.25 81/.25 83/.25 81/.25 80/.25 81/.25
  84 81/.5 84/.5 83/.5 81/.5 79/.5 81/.5
  83/.5 81/.5 79/.5 81/.5 83/.5 81/.5 79/.5 78/.5 76`)

const tell = phrase(`59/.5 59/.25 59/.25 59/.5 59/.25 59/.25
  64/.5 66/.5 68/.5 59/.25 59/.25
  59/.5 59/.25 59/.25 64/.5 68/.25 68/.25
  66/.5 63/.5 59/.5 59/.25 59/.25
  59/.5 59/.25 59/.25 59/.5 59/.25 59/.25
  64/.5 66/.5 68/.5 64/.25 68/.25
  71/1.25 69/.25 68/.25 66/.25
  64/.5 68/.5 64/.5 59/.25 59/.25`)
const cancanA = phrase(`69/.5 76/.5 76/.5 78/.5 76/.5 74/.5 74/.5 78/.5
  79/.5 83/.5 86/.5 83/.5 83/.5 81/.5 81
  83/.5 73/.5 73/.5 83/.5 81/.5 74/.5 74/.5 78/.5
  78/.5 76/.5 78/.5 76/.5`)
const cancan = [...cancanA, ...phrase('78/.5 76/.5 78/.5 76/.5'), ...cancanA, ...phrase('76/.5 74/.5 74')]

export const SONGS = [
  { id: 'twinkle', title: '반짝반짝 작은 별', subtitle: 'Twinkle, Twinkle, Little Star', icon: '✦', difficulty: 'easy', lanes: [0, 4], bpm: 104, bassMidi: 48, melody: twinkle },
  { id: 'jacques', title: '프레르 자크', subtitle: 'Frère Jacques', icon: '♬', difficulty: 'easy', lanes: [0, 2, 4], bpm: 112, bassMidi: 48, melody: [...jacques, ...jacques] },
  { id: 'mary', title: '메리의 작은 양', subtitle: 'Mary Had a Little Lamb', icon: '♡', difficulty: 'easy', lanes: [0, 2, 4], bpm: 116, bassMidi: 48, melody: [...mary, ...mary] },
  { id: 'ode', title: '환희의 송가', subtitle: '베토벤 · 교향곡 9번', icon: '☀', difficulty: 'normal', lanes: [0, 1, 3, 4], bpm: 132, melody: [...ode, ...ode] },
  { id: 'elise', title: '엘리제를 위하여', subtitle: '베토벤 · Für Elise', icon: '♩', difficulty: 'normal', lanes: [0, 1, 2, 3, 4], bpm: 108, melody: [...elise, ...elise] },
  { id: 'spring', title: '사계 · 봄', subtitle: '비발디 · 1악장 주제', icon: '❀', difficulty: 'normal', lanes: [0, 1, 2, 3, 4], bpm: 88, melody: spring },
  { id: 'turkish', title: '터키 행진곡', subtitle: '모차르트 · K.331', icon: '♜', difficulty: 'hard', lanes: [0, 1, 2, 3, 4], bpm: 120, melody: [...turkish, ...turkish, ...turkish, ...turkish] },
  { id: 'tell', title: '윌리엄 텔 서곡', subtitle: '로시니 · 질주하는 피날레', icon: '♞', difficulty: 'hard', lanes: [0, 1, 2, 3, 4], bpm: 120, melody: [...phrase('59/.25 59/.25'), ...tell, ...tell, ...tell, ...tell.slice(0, -2), ...phrase('-/.5')] },
  { id: 'cancan', title: '캉캉', subtitle: '오펜바흐 · 지옥의 갤럽', icon: '♢', difficulty: 'hard', lanes: [0, 1, 2, 3, 4], bpm: 144, melody: [...cancan, ...cancan] },
  ...RECORDED_SONGS,
]

export const LEAD_IN_MS = 1400
export function songTimeline(song) {
  if (song.audioFile) return {
    melody: [], bass: [],
    targets: song.beats.map((beat, id) => ({ id, time: Math.round(LEAD_IN_MS + beat * 60000 / song.bpm) })),
    duration: LEAD_IN_MS + song.audioDurationMs + 700,
  }
  let time = LEAD_IN_MS
  const melody = song.melody.map((note, id) => {
    const duration = note.beats * 60000 / song.bpm
    const event = { ...note, id, time: Math.round(time), duration }
    time += duration
    return event
  })
  const bass = []
  // The nursery songs retain their quiet original C-major pulse. Classical
  // excerpts are unaccompanied so an invented drone cannot clash with their harmony.
  for (let beat = 0; song.bassMidi !== undefined && LEAD_IN_MS + beat * 60000 / song.bpm < time - 1; beat += 4) {
    bass.push({ midi: song.bassMidi, time: LEAD_IN_MS + beat * 60000 / song.bpm, duration: 2 * 60000 / song.bpm })
  }
  return { melody, bass, targets: melody.filter(note => note.midi !== null), duration: time + 700 }
}
