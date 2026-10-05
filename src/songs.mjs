import { RECORDED_SONGS } from './recorded-songs.mjs'
import { SHORT_MELODIES } from './short-melodies.mjs'
import elise from './scores/elise.mjs'
import spring from './scores/spring.mjs'
import turkish from './scores/turkish.mjs'
import tell from './scores/tell.mjs'
import cancan from './scores/cancan.mjs'

// Actual complete tunes, themes, movements or explicitly identified excerpts.
// Never repeat an entire tune merely to reach a target duration.
const scoreSong = (song, score) => ({
  ...song, score, bpm: score.bpm, lanes: [0, 1, 2, 3, 4],
  credit: {
    source: score.sourceUrl, artist: score.attribution,
    license: score.license, licenseUrl: score.licenseUrl,
    summary: '원래 악보의 구성과 반복을 따라 합성했어요. 게임용 표적은 선율의 실제 시작점에서 골랐어요. 악보·변환 데이터의 라이선스는 코드와 별개예요.',
  },
})
export const SONGS = [
  { id: 'twinkle', title: '반짝반짝 작은 별', subtitle: 'Twinkle, Twinkle, Little Star', icon: '✦', difficulty: 'easy', lanes: [0, 4], bpm: 104, bassMidi: 48, melody: SHORT_MELODIES.twinkle, scopeLabel: '동요 한 곡 전체', scope: '원래 여섯 구절을 처음부터 끝까지 한 번 연주해요.' },
  { id: 'jacques', title: '프레르 자크', subtitle: 'Frère Jacques', icon: '♬', difficulty: 'easy', lanes: [0, 2, 4], bpm: 112, bassMidi: 48, melody: SHORT_MELODIES.jacques, scopeLabel: '동요 한 곡 전체', scope: '원래 돌림노래 선율 전체를 한 번 연주해요. 다른 성부로 다시 시작하지 않아요.' },
  { id: 'mary', title: '메리의 작은 양', subtitle: 'Mary Had a Little Lamb', icon: '♡', difficulty: 'easy', lanes: [0, 2, 4], bpm: 116, bassMidi: 48, melody: SHORT_MELODIES.mary, scopeLabel: '동요 한 절 전체', scope: '익숙한 동요 한 절의 처음부터 마지막 음까지 연주해요. 역사적 선율을 고른 박자로 각색했어요.' },
  { id: 'ode', title: '환희의 송가', subtitle: '베토벤 · 전체 주제 선율', icon: '☀', difficulty: 'normal', lanes: [0, 1, 3, 4], bpm: 132, melody: SHORT_MELODIES.ode, scopeLabel: '16마디 주제 전체', scope: '대조 구절과 종지를 포함한 첫 독창 주제 전체예요. 교향곡이나 4악장 전체는 아니에요.' },
  scoreSong({ id: 'elise', title: '엘리제를 위하여', subtitle: '베토벤 · Für Elise', icon: '♩', difficulty: 'normal', scopeLabel: '피아노 전곡', scope: 'A–B–A–C–A, 두 대조부와 마지막 종지까지 양손 악보를 연주해요.' }, elise),
  scoreSong({ id: 'spring', title: '사계 · 봄', subtitle: '비발디 · 1악장 전체', icon: '❀', difficulty: 'normal', scopeLabel: '1악장 전체', scope: '새소리·시냇물·폭풍·재현을 포함한 1악장 전체예요. 다섯 성부를 기존 연습 템포 88 BPM으로 연주해요.' }, spring),
  scoreSong({ id: 'turkish', title: '터키 행진곡', subtitle: '모차르트 · K.331 피날레', icon: '♜', difficulty: 'hard', scopeLabel: '피아노 전곡', scope: '장·단조 대조부, 재현과 코다까지 피아노 전곡을 연주해요.' }, turkish),
  scoreSong({ id: 'tell', title: '윌리엄 텔 서곡', subtitle: '로시니 · 피날레 전체', icon: '♞', difficulty: 'hard', scopeLabel: '피날레 전체', scope: '팡파르·갤럽·대조부·코다를 포함한 마지막 Allegro vivace 전체예요. 4부로 된 서곡 전체는 아니에요.' }, tell),
  scoreSong({ id: 'cancan', title: '캉캉', subtitle: '오펜바흐 · 갤럽 전체 선율', icon: '♢', difficulty: 'hard', scopeLabel: '갤럽 전체 · 선율 축약', scope: '도입·두 조성의 합창·간주·코다까지 실제 순서로 연주해요. 안쪽 반주와 장식음을 생략한 주선율 편곡이에요.' }, cancan),
  ...RECORDED_SONGS.map(song => ({ ...song, scopeLabel: song.id === 'edm-detection-mode' ? '처음부터 4분 발췌' : '원곡 처음부터 끝까지', scope: song.id === 'edm-detection-mode' ? '원곡 약 6분 6초 중 처음부터 4분의 악절 끝까지 발췌했어요. 길이를 채우는 반복은 없어요.' : '실제 원곡을 첫 도입부터 자연스러운 마지막 소리까지 연주해요.' })),
]

export const LEAD_IN_MS = 1400
export function songTimeline(song, leadInMs = LEAD_IN_MS) {
  if (song.audioFile) return {
    melody: [], bass: [],
    targets: song.beats.map((beat, id) => ({ id, side: song.targetLanes[id], time: leadInMs + Math.round(beat * 60000 / song.bpm) })),
    duration: leadInMs + song.audioDurationMs + 700,
  }
  if (song.score) return {
    melody: song.score.events.map(([time, duration, midi, velocity, lead]) => ({ time: leadInMs + time, duration, midi, gain: (lead ? .16 : .04) * velocity / 127 * song.score.gainScale })),
    bass: [],
    targets: song.score.targets.map(([time, midi, duration], id) => ({ id, time: leadInMs + time, duration, midi })),
    duration: leadInMs + song.score.durationMs + 700,
  }
  let time = 0
  const melody = song.melody.map((note, id) => {
    const duration = note.beats * 60000 / song.bpm
    const event = { ...note, id, time: leadInMs + Math.round(time), duration }
    time += duration
    return event
  })
  const bass = []
  for (let beat = 0; song.bassMidi !== undefined && beat * 60000 / song.bpm < time - 1; beat += 4) {
    bass.push({ midi: song.bassMidi, time: leadInMs + beat * 60000 / song.bpm, duration: 2 * 60000 / song.bpm })
  }
  return { melody, bass, targets: melody.filter(note => note.midi !== null), duration: leadInMs + time + 700 }
}
