// Complete short nursery tunes and one complete Ode-to-Joy sung theme statement.
// Quarter-note beats. MIDI C4 = 60. Original synthesis only; no sampled recording.
// Source and adaptation details: public/music-sources/CREDITS.md.
const phrase = text => text.trim().split(/\s+/).map(token => {
  const [pitch, beats = '1'] = token.split('/')
  return { midi: Number(pitch), beats: Number(beats) }
})

export const SHORT_MELODIES = {
  // Six two-bar phrases: A B C C A B. The returning opening and duplicated
  // middle phrase belong to the nursery tune; do not repeat the entire tune.
  twinkle: phrase(`
    60 60 67 67 69 69 67/2
    65 65 64 64 62 62 60/2
    67 67 65 65 64 64 62/2
    67 67 65 65 64 64 62/2
    60 60 67 67 69 69 67/2
    65 65 64 64 62 62 60/2
  `),

  // All eight short phrases in the printed 1811 round, transposed G -> C.
  // A A B B C C D D is the actual tune, not eight whole-tune loops.
  jacques: phrase(`
    60 62 64 60
    60 62 64 60
    64 65 67/2
    64 65 67/2
    67/.5 69/.5 67/.5 65/.5 64 60
    67/.5 69/.5 67/.5 65/.5 64 60
    60 55 60/2
    60 55 60/2
  `),

  // Familiar complete nursery stanza, preserving the existing repeated-E
  // variant. Original straight-beat adaptation of the historical Merrily
  // melody, not a note-for-note transcription of Carmina Yalensia's rhythm.
  mary: phrase(`
    64 62 60 62 64 64 64/2
    62 62 62/2 64 64 64/2
    64 62 60 62 64 64 64 64
    62 62 64 62 60/4
  `),

  // Complete 16-bar baritone sung melody, Symphony 9 finale, mm. 241-256.
  // 1864 score pp.198-200; transposed D major -> C major and raised an octave.
  // First two paragraphs are mm.241-244 and mm.245-248.
  // Third paragraph is mm.249-252 plus the tied first beat of m.253.
  // E4/2 crosses the m.252/253 barline: it is ONE held note, not a new onset.
  // Final paragraph starts on beat 2 of m.253 and ends with m.256's tonic.
  // Includes Beethoven's eighth-note turn in m.254. No whole-theme padding.
  ode: phrase(`
    64 64 65 67 67 65 64 62 60 60 62 64 64/1.5 62/.5 62/2
    64 64 65 67 67 65 64 62 60 60 62 64 62/1.5 60/.5 60/2
    62 62 64 60 62 64/.5 65/.5 64 60 62 64/.5 65/.5 64 62 60 62 55 64/2
    64 65 67 67 65 64 65/.5 62/.5 60 60 62 64 62/1.5 60/.5 60/2
  `),
}

