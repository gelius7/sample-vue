# Play a Little · 작은 게임 놀이터

## Project setup

Use Node.js 22 LTS and its bundled npm 10 (`nvm use` if you use nvm).

```
npm ci
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Validate the project
```
npm test
npm run lint -- --no-fix
npm run build
```

Run `npm test` for song/chart synchronization, scoring, audio lifecycle, navigation structure, and fruit physics checks.

### GitHub Pages

In repository Settings → Pages, select **GitHub Actions** as the source.
The Node CI workflow builds and deploys `master` to
https://gelius7.github.io/sample-vue/ after lint and build pass.
Pull requests are checked but never deployed.

The workflow sets `PUBLIC_PATH=/sample-vue/` for project-site assets.
Local development and ordinary builds continue to use `/`.

## Games

- **냥냥 리듬 클럽** (`#bongo`): original SVG cat, five colored touch/keyboard percussion pads (A/S/D/K/L), and 12 songs. Choose a difficulty category, then one of its songs: difficulty belongs to the music, not a second setting on the same song. Easy nursery songs use two or three pads; the classical and electronic tracks introduce more pads, rests, offbeats, and faster runs. Every synthesized target follows an actual melody onset and its lanes follow pitch height and melodic contour, retaining repeated pitches when playable and using nearby pads for fast repetitions. The three recorded tracks keep their groove-aligned timing and use hand-authored phrase/accent lane motifs; they are not automatic pitch transcriptions. All songs share ±150 ms Good and ±70 ms Perfect timing with the original per-difficulty falling speed. During a phone round, the note field fills roughly 80% of the viewport, with pads and pause/song controls kept on screen. A taller field adds look-ahead time and a matching audio/chart count-in; resizing never accelerates the notes. No faster filler grid is overlaid on a slow melody. Perfect earns 100 points, Good 70, plus a small combo bonus. Browser-only records use `bongo-cat-best-v4-{song}`; older chart records are left untouched and never misattributed. Changing category/song resets the round and cancels audio, timers, and animation.
- **수박 만들기** (`#watermelon`): drop and combine matching fruits into larger ones, with score, best score, pause, restart, and overflow game over. Original canvas artwork and lightweight local physics.

No account, tracking, server, or game API is used. Three credited, licensed music excerpts are served locally with the app; other songs are synthesized in Web Audio. Sound only starts after a gesture. Mute, pause/resume, and replay are supported. Recorded clips are fetched on first play, decoded and cached; pause/resume seeks to the matching chart position. Failed loads can be retried, and late load completion cannot start a different song or revive a backgrounded/unmounted game. Switching away from the page pauses a round; leaving a game destroys its state and stops its audio/animation/listeners.

## Adding another game

1. Create a self-contained Vue component under `src/components/` with scoped styles.
2. Add its import and card metadata to `src/games.js`.
3. Clean up animation frames, audio, timers, and global listeners in `onUnmounted`. Handle page visibility where gameplay needs pausing.
4. Add a focused check under `tests/` and include it in `npm test`.

`App.vue` owns only the game picker and hash navigation (including browser Back/Forward). The selected component is keyed and unmounted on game changes; there is no shared mutable game state or plugin framework. The home card artwork has a generic fallback for new entries; customize it if desired.

## Music provenance

The first nine songs use only historic melody lines. Their Web Audio timbre, nursery accompaniment, and short playable excerpts are original; no modern classical recording, arrangement, or lyrics (including translated lyrics) are copied. The three separately licensed recordings are listed below.

- **반짝반짝 작은 별 / Twinkle, Twinkle, Little Star**: traditional French melody, *Ah! vous dirai-je, maman*. The Morgan Library links it to Twinkle and documents Mozart's surviving 1781–1782 variations: https://www.themorgan.org/exhibitions/online/mozart/418 . Mozart did not compose the underlying traditional melody.
- **프레르 자크 / Frère Jacques**: documented in *La clé du caveau* (1811), page 309, no. 726: https://www.themorgan.org/music-manuscripts-and-printed-music/130800 .
- **메리의 작은 양 / Mary Had a Little Lamb**: the familiar melodic contour is documented in the “Good Night” chorus (“Merrily we roll along”), *Carmina Yalensia* (1867), printed page 47 (PDF page 53): https://upload.wikimedia.org/wikipedia/commons/e/e4/Carmina_Yalensia_-_a_complete_and_accurate_collection_of_Yale_College_songs_-_with_piano_accompaniment_(IA_carminayalensiac00garr).pdf#page=53 . This game uses its repeated-E phrase. This is not the different Lowell Mason setting of 1831.

### Classical excerpts (original synthesis)

- **환희의 송가 / Ode to Joy**: Beethoven, Symphony No. 9, Op. 125 (completed 1824; first print 1826). Theme transposed to C major. [Beethoven-Haus work record](https://www.beethoven.de/de/work/view/5556714292117504).
- **엘리제를 위하여 / Für Elise**: Beethoven, WoO 59 (1810; first print 1867). Opening A-minor theme, with a short rest at each excerpt boundary. [Beethoven-Haus work record](https://www.beethoven.de/de/work/view/5327609864912896).
- **사계 · 봄 / Spring**: Vivaldi, RV 269, first movement (first print 1725). Principal pitches from the original solo-violin part, with trill ornament omitted and a moderate practice tempo. [BnF original edition](https://gallica.bnf.fr/ark:/12148/btv1b525002238), [inspected 1725 facsimile](https://s9.imslp.org/files/imglnks/usimg/4/49/IMSLP310699-PMLP126432-rv_269_violinos.pdf).
- **터키 행진곡 / Rondo alla turca**: Mozart, K. 331 finale (first print 1784). Historical opening theme, ornamental grace notes omitted. [Mozarteum catalog](https://kv.mozarteum.at/de/work/sonate-in-a-4091), [1878 score, printed p.126 / PDF p.9](https://vmirror.imslp.org/files/imglnks/usimg/f/fe/IMSLP56321-PMLP01846-Mozart_Werke_Breitkopf_Serie_20_KV331.pdf).
- **윌리엄 텔 서곡 / William Tell overture**: Rossini, galop theme (1829). Original-note first-violin theme with final pickup omitted at the excerpt ending. [University of Bologna premiere record](https://corago.unibo.it/libretto/DMBM20690), [historical full score, printed pp.30–31 / PDF pp.34–35](https://ks15.imslp.org/files/imglnks/usimg/1/14/IMSLP320363-PMLP07234-Rossini_-_GuillaumeTell_I_(fs.ed.Brandus).pdf).
- **캉캉 / Galop infernal**: Offenbach, *Orphée aux enfers* (1858; revised 1874). Historical D-major theme, ornamental grace notes omitted. [BnF catalog](https://catalogue.bnf.fr/ark:/12148/cb13916735c), [Bote & Bock score, ca.1880, printed p.123 / PDF p.2](https://s9.imslp.org/files/imglnks/usimg/7/7d/IMSLP26815-PMLP24816-Offenbach_Orpheus_in_der_Unterwelt_Galop_infernal_BB_vs.pdf).

These historical compositions and source editions are public domain. Modern recordings and arrangements have separate rights; none are used for the nine synthesized songs.

### Licensed recorded excerpts

**Electrodoodle**, **Disco Medusae**, and **EDM Detection Mode** by **Kevin MacLeod (incompetech.com)** are included under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). The recordings are excerpted, faded, and volume-adjusted for this game, without tempo or pitch changes. Their music license is separate from this repository's MIT code license. The game's expandable music credits show the attribution and source links; exact source files, excerpt timings, and changes are recorded in [public/audio/CREDITS.md](public/audio/CREDITS.md).

- [Electrodoodle official source](https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1200079)
- [Disco Medusae official source](https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1500041)
- [EDM Detection Mode official source](https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1500026)

The clips are local app assets and do not make runtime requests to third-party music sites.

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## vue-cli install

* npm i -g @vue/cli @vue/cli-service-global

## Create sample vue project

```bash
$ vue create vue-app
```
* select default

```bash
cd vue-app
npm run serve
```

* Access site
  * localhost:8080

## Reference

* https://www.taniarascia.com/getting-started-with-vue/
