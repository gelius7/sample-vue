// Kevin MacLeod recordings, used under CC BY 4.0. These are edited excerpts,
// not public-domain music. Full source, edit, and license details: public/audio/CREDITS.md.
// Each row is one 4/4 bar. Values are selected audible attacks in quarter-note
// units, not a generated eighth-note grid. Empty space deliberately has no target.
// The small measured source attack offset is retained relative to the MP3 buffer.
const onsets = (bpm, firstBeatMs, bars) => bars.flatMap((bar, index) =>
  bar.map(beat => index * 4 + beat + firstBeatMs * bpm / 60000))

export const RECORDED_SONGS = [
  {
    id: 'electrodoodle', title: 'Electrodoodle', subtitle: 'Kevin MacLeod · 통통 튀는 일렉트로',
    icon: '⚡', difficulty: 'normal', lanes: [0, 1, 2, 3, 4], bpm: 120,
    audioFile: 'audio/electrodoodle.mp3', audioDurationMs: 32000, firstBeatMs: 26,
    // The synth's first four-bar syncopation, a sparse answer, then the rising
    // offbeat hook. Backbeat targets anchor the bars where the lead takes a rest.
    beats: onsets(120, 26, [
      [0, .75, 1.5, 2.25, 3],
      [0, .5, 1.25, 2, 2.75, 3.5],
      [0, .75, 1.75, 2.5, 3.25],
      [0, .75, 1.5, 2.25, 3],
      [0, 1, 1.5, 3],
      [0, .75, 1.5, 2, 3],
      [0, .75, 1.5, 2, 3],
      [0, .75, 1.5, 2.5, 3],
      [0, .75, 2.5, 3, 3.5],
      [0, 1, 2, 2.5, 3, 3.5],
      [0, .75, 2.5, 3, 3.5],
      [0, 1, 2, 3],
      [0, .75, 2, 2.5, 3, 3.5],
      [0, 1, 2, 2.5, 3, 3.5],
      [0, .75, 2.5, 3, 3.5],
      [0, 1, 2],
    ]),
    credit: {
      title: 'Electrodoodle', artist: 'Kevin MacLeod', isrc: 'USUAN1200079',
      source: 'https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1200079',
      download: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Electrodoodle.mp3',
      license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      changes: '16.000–48.000 s excerpt; gain ×0.80; 10 ms fade-in, 500 ms fade-out; MP3 re-encoding. No tempo or pitch change.',
    },
  },
  {
    id: 'disco-medusae', title: 'Disco Medusae', subtitle: 'Kevin MacLeod · 엇박을 타는 디스코',
    icon: '✹', difficulty: 'normal', lanes: [0, 1, 2, 3, 4], bpm: 115,
    audioFile: 'audio/disco-medusae.mp3', audioDurationMs: 33391.315192743765, firstBeatMs: 26,
    // Clavinet/guitar attacks land just after beat 1 and before beat 3, with
    // occasional drum anchors. The arrangement thins in the second eight bars.
    beats: onsets(115, 26, [
      [.25, 1, 1.75, 2.75, 3.25],
      [.25, 1, 1.75, 2.75, 3.5],
      [0, 1, 1.75, 2.75, 3.25],
      [.25, 1, 1.75, 2.75, 3.5],
      [0, .5, 1, 1.75, 2.75, 3.25],
      [.25, 1, 1.75, 2.75, 3.5],
      [0, 1, 1.75, 2.75, 3.25],
      [.25, 1, 1.75, 2.75, 3.5],
      [.25, 1, 1.75, 3.25],
      [.25, 1, 1.75, 2.5, 3.25],
      [0, 1, 1.75, 3.25],
      [.25, 1, 1.75, 2.5, 3.25],
      [.25, 1, 1.75, 3.25],
      [0, 1, 1.75, 2.5, 3.25],
      [.25, 1, 1.75, 3.25],
      [.25, 1, 1.75],
    ]),
    credit: {
      title: 'Disco Medusae', artist: 'Kevin MacLeod', isrc: 'USUAN1500041',
      source: 'https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1500041',
      download: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Disco%20Medusae.mp3',
      license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      changes: '20.869569–54.260884 s excerpt; gain ×0.91; 10 ms fade-in, 500 ms fade-out; MP3 re-encoding. No tempo or pitch change.',
    },
  },
  {
    id: 'edm-detection-mode', title: 'EDM Detection Mode', subtitle: 'Kevin MacLeod · 촘촘한 신스와 비트',
    icon: '◆', difficulty: 'hard', lanes: [0, 1, 2, 3, 4], bpm: 128,
    audioFile: 'audio/edm-detection-mode.mp3', audioDurationMs: 30000, firstBeatMs: 22,
    // The main synth's 3/16 pickups and 1/16 replies, then the offbeat hi-hats
    // entering halfway through this excerpt. No targets on the first half's
    // missing hats; the final scoring notes end before the audio's release fade.
    beats: onsets(128, 22, [
      [0, .75, 1, 1.5, 2, 2.25, 3],
      [0, .75, 1, 1.5, 2, 2.25, 3],
      [0, .75, 1, 1.5, 2, 2.25, 3],
      [0, .75, 1, 1.5, 2, 2.25, 3],
      [0, .75, 1, 1.5, 2, 2.25, 3],
      [0, .75, 1, 1.5, 2, 2.25, 3],
      [0, .75, 1, 1.5, 2, 2.25, 3],
      [0, .75, 1, 1.5, 2, 2.25, 3, 3.25],
      [0, .5, .75, 1, 1.5, 2, 2.25, 2.5, 3, 3.5],
      [0, .5, .75, 1, 1.5, 2, 2.25, 2.5, 3, 3.5],
      [0, .5, .75, 1, 1.5, 2, 2.25, 2.5, 3, 3.5],
      [0, .5, .75, 1, 1.5, 2, 2.25, 2.5, 3, 3.5],
      [0, .5, .75, 1, 1.5, 2, 2.25, 2.5, 3, 3.5],
      [0, .5, .75, 1, 1.5, 2, 2.25, 2.5, 3, 3.5],
      [0, .5, .75, 1, 1.5, 2, 2.25, 2.5, 3, 3.5],
      [0, .5, .75, 1, 1.5, 2],
    ]),
    credit: {
      title: 'EDM Detection Mode', artist: 'Kevin MacLeod', isrc: 'USUAN1500026',
      source: 'https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1500026',
      download: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/EDM%20Detection%20Mode.mp3',
      license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      changes: '30.000–60.000 s excerpt; gain ×0.76; 10 ms fade-in, 500 ms fade-out; MP3 re-encoding. No tempo or pitch change.',
    },
  },
]
