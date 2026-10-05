# Music forms and score sources

The music follows actual tunes, score forms and recordings. No whole song is multiplied to fill a duration quota. Short tunes end naturally; written musical repeats remain. The four-minute limit applies to music; the visual count-in and 700 ms result tail are additional.

## What each selection contains

| Selection | Music length | Scope |
| --- | --- | --- |
| Twinkle, Twinkle, Little Star | 0:27.69 | Complete familiar six-phrase nursery tune once |
| Frère Jacques | 0:17.14 | Complete AABBCCDD round melody once, one voice |
| Mary Had a Little Lamb | 0:16.55 | Complete familiar stanza, straight-beat adaptation |
| Ode to Joy | 0:29.09 | Complete first 16-bar sung theme, not the symphony or entire finale |
| Für Elise | 2:36.25 | Complete piano piece, both staves, A–B–A–C–A |
| Rondo alla turca | 3:43.50 | Complete piano finale, both staves, written repeats and coda |
| Spring | 3:43.98 | Complete first Allegro, all five string parts, practice tempo 88 BPM |
| William Tell | 3:18.95 | Complete final Allegro vivace/galop, 16 parts; not the entire overture |
| Galop infernal / Can-can | 2:23.33 | Entire number's formal sequence as a primary-melody reduction |
| Electrodoodle | 2:46.06 | Complete original recording |
| Disco Medusae | 3:41.28 | Complete original recording, including introduction |
| EDM Detection Mode | 4:00.00 | Opening excerpt ending at the original 128-bar boundary; full recording is about 6:06 |

## Short tunes and Beethoven's sung theme

- **Twinkle**: complete plain nursery melody, 48 quarter-note beats, A–B–C–C–A–B. The [Fluteflute engraving](https://commons.wikimedia.org/wiki/File:Twinkle_Twinkle_Sheet_Music.png) is explicitly dedicated to the public domain by its author. Its pitches and durations were checked. The historical Mozart K.265 theme contains different ornaments/rhythms and is not represented as this exact nursery version.
- **Frère Jacques**: complete 32-beat melody from Pierre Capelle, *La Clé du caveau* (1811), printed p.309, no.726, [scan p.321](https://fr.wikisource.org/wiki/Page:Capelle_-_La_Cl%C3%A9_du_caveau,_1811.djvu/321). Transposed uniformly from G to C; original note values retained. Composition and historical engraving are public domain.
- **Mary**: one complete 32-beat familiar nursery stanza, retaining the game's repeated-E variant. The old contour appears in the “Merrily we roll along” chorus of *Carmina Yalensia* (1867), [printed p.47 / PDF p.53](https://upload.wikimedia.org/wikipedia/commons/e/e4/Carmina_Yalensia_-_a_complete_and_accurate_collection_of_Yale_College_songs_-_with_piano_accompaniment_(IA_carminayalensiac00garr).pdf#page=53). The game uses its own regular quarter/half/whole-note nursery adaptation and an extra repeated E in the third phrase. It is **not** a note-for-note transcription of that edition's dotted rhythms and rests, nor Lowell Mason's different 1831 setting. No modern arrangement or recording is copied.
- **Ode to Joy**: the entire first baritone sung theme, finale mm.241–256, Beethoven *Werke*, Breitkopf & Härtel 1864, plate B.9, [printed/PDF pp.198–200](https://s9.imslp.org/files/imglnks/usimg/1/11/IMSLP516486-PMLP1607-Beethoven_Breitkopf_Serie_1_Band_3_B_9_1_(etc).pdf#page=198). The contrasting bridge, return, final cadence, small m.254 turn and m.252–253 held tie are preserved. Transposed D to C and raised an octave. Introductory calls and later choral restatements are outside this clearly identified complete theme statement. Historical composition and engraving are public domain.

## Complete piano scores

**Für Elise, WoO 59**: [Mutopia 931](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=931), based on Breitkopf & Härtel 1888, typeset by Stelios Samelis, Mutopia-2015/08/18-931. The exact LilyPond header and PDF footer dedicate the edition to the **Public Domain**. Quarter =72 is explicitly in its source. All 1,041 musical notes of both staves are retained after unfolding the two written repeats and correct alternate endings. The F-major episode, low-A/diminished-chord episode, rising arpeggios/chromatic descent and final refrain are present. The final eighth rest is retained.

**Rondo alla turca, K.331/III**: [Mutopia 108](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=108), typeset by Rune Zedeler and Chris Sawer, Mutopia-2015/08/13-108. The exact source header/footer dedicate the edition to the **Public Domain**. The form was also compared with Mozart *Werke*, Breitkopf & Härtel 1878, printed pp.126–129. Quarter =120 is an Allegretto performance choice matching the earlier game; the downloadable MIDI's unmarked default =60 is not a printed metronome instruction. All 2,810 musical notes of both staves, the eight initial written repeat spans, alternate endings and complete A-major coda are retained. One invisible A4 grace event used only to position an engraving slur is excluded; affected note lengths and the second-ending grace strum are corrected to match the score. The final quarter rest remains.

The public MIDI files do not correctly unfold volta repeats. This game follows the score's repeat/ending order rather than playing first and second endings consecutively. This is synthesized score playback; source MIDI does not realize every pedal, expressive or ornament instruction. It is not a recording of a human pianist. See [Mutopia's license explanation](https://www.mutopiaproject.org/legal.html).

## Complete orchestral forms

**Spring, RV269/I**: [Mutopia 301](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=301), typeset by Anonymous, Mutopia-2010/02/08-301, copyright 2010. The exact source header and PDF footer license this edition under **[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)**. All 3,173 note events across solo violin, two orchestral violins, viola and cello are retained, including the pickup and 82 complete bars. Bird calls, murmuring streams, thunderstorm, minor-key return, final solo and closing cadence follow the original sequence. The game uses the pre-existing practice tempo 88 BPM, converting the source's nominal 115 BPM without omitting notes or adding repeats. The source MIDI omits trill/mordent realization and fermata extension. The adapted score data in `src/scores/spring.mjs` retains CC BY-SA 3.0.

**William Tell, final Allegro vivace**: Rossini, complete final 252 bars (overture mm.226–477), quarter =152, matching the historical score. [Jan Trukenmüller's Midica transcription](https://github.com/truj/midica/blob/master/examples/rossini_william_tell_overture_finale-lowlevel.midica) explicitly states **MPL-2.0**; the original composition's public-domain status does not erase that source license. All 16,922 source notes in 16 parts are retained, including opening fanfare, galop themes, contrasting passages and coda. Representative structure, fanfare, main theme and final cadence were compared with the Troupenas/Brandus historical full score, PDF pp.29–54 / printed pp.25–50. Twenty-two coda flute notes were corrected down one octave against the printed normal-flute staff (finale mm.224, 227 and 232–235). This is not a claim of exhaustive independent collation of every note. The original notation, exact corrections and [MPL license](MPL-2.0.txt) are included here; the adapted modifiable source is [src/scores/tell.mjs](https://github.com/gelius7/sample-vue/blob/master/src/scores/tell.mjs), under MPL-2.0. The game timbre is synthesized, not an orchestral recording.

**Galop infernal / Can-can**: Offenbach, Bote & Bock, ca.1880, plate10779, [printed pp.122–126 / PDF pp.1–5](https://s9.imslp.org/files/imglnks/usimg/7/7d/IMSLP26815-PMLP24816-Offenbach_Orpheus_in_der_Unterwelt_Galop_infernal_BB_vs.pdf). The historical composition and exact edition are public domain. A newly typed primary-melody reduction follows all 172 performed 2/4 bars: Allegro introduction, two instrumental strains with first/second endings, G-major chorus, instrumental reprise, D-major chorus and complete coda. Instrumental passages use the upper piano line; chorus passages use the principal sung line. The internal accompaniment and grace ornaments are omitted, so this is a complete formal **lead reduction**, not a full orchestral transcription. Quarter =144 is a performance choice; no whole-number padding or artificial repeat is added.

## Playback and game charts

The complete score voices and gameplay targets are separate. Every supplied audio event is retained; the lead chart selects actual note onsets at least 105 ms apart, leaving faster ornaments audible without forcing physically unfair taps. Score times are rounded once to milliseconds. Low pitches map left, high pitches right, with neighboring-pad alternation for rapid repeats. No round-robin filler chart is used.

Full scores are scheduled one second ahead on the shared Web Audio clock. Replay and pause/resume use the same absolute musical timeline. Relative source velocities are retained, lead and accompaniment are balanced, and the densely orchestrated Tell data is conservatively gain-scaled to avoid an excessive summed music level. The five game pads are independent percussion sounds.

Verification includes source score/form comparisons, complete event counts, note-on/off pairing and bounds, original repeat/ending order, section landmarks, MIDI/event round trips, target/audio onset identity, shared clock offsets, full streamed-score completion, pause/resume and scoring tests. The source-recording edits additionally have PCM frame, waveform attack and consecutive-block correlation checks in [audio/CREDITS.md](../audio/CREDITS.md). No listening audition is claimed by these automated/source checks.
