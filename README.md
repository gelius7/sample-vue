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

- **냥냥 리듬 클럽** (`#bongo`): original SVG cat, two touch/keyboard pads, and three selectable instrumental children's melodies. Choose Easy, Normal, or Hard without changing the music's tempo. Easy uses spaced melody onsets and alternating paws; Normal follows every melody onset with varied hand patterns; Hard adds half-beat pulses and double taps. Timing windows tighten from ±220 ms to ±150 ms to ±100 ms (Perfect: ±110/70/45 ms). Each song lasts about 30–37 seconds. Perfect timing earns 100 points, good timing 70, plus a small combo bonus. Best scores are stored separately for all nine song/difficulty combinations on this browser. The new charts use versioned records; previous single-level scores are left untouched. Changing a song or difficulty stops and resets the round.
- **수박 만들기** (`#watermelon`): drop and combine matching fruits into larger ones, with score, best score, pause, restart, and overflow game over. Original canvas artwork and lightweight local physics.

No account, tracking, server, game API, or downloaded audio is used. Sound only starts after a gesture. Mute, pause/resume, and replay are supported. Switching away from the page pauses a round; leaving a game destroys its state and stops its audio/animation/listeners.

## Adding another game

1. Create a self-contained Vue component under `src/components/` with scoped styles.
2. Add its import and card metadata to `src/games.js`.
3. Clean up animation frames, audio, timers, and global listeners in `onUnmounted`. Handle page visibility where gameplay needs pausing.
4. Add a focused check under `tests/` and include it in `npm test`.

`App.vue` owns only the game picker and hash navigation (including browser Back/Forward). The selected component is keyed and unmounted on game changes; there is no shared mutable game state or plugin framework. The home card artwork has a generic fallback for new entries; customize it if desired.

## Music provenance

Only the historic melody lines below are used. The Web Audio timbre and simple accompaniment in this repository are original; there are no copied recordings, modern arrangements, or lyrics (including translated lyrics).

- **반짝반짝 작은 별 / Twinkle, Twinkle, Little Star**: traditional French melody, *Ah! vous dirai-je, maman*. The Morgan Library links it to Twinkle and documents Mozart's surviving 1781–1782 variations: https://www.themorgan.org/exhibitions/online/mozart/418 . Mozart did not compose the underlying traditional melody.
- **프레르 자크 / Frère Jacques**: documented in *La clé du caveau* (1811), page 309, no. 726: https://www.themorgan.org/music-manuscripts-and-printed-music/130800 .
- **메리의 작은 양 / Mary Had a Little Lamb**: the familiar melodic contour is documented in the “Good Night” chorus (“Merrily we roll along”), *Carmina Yalensia* (1867), printed page 47 (PDF page 53): https://upload.wikimedia.org/wikipedia/commons/e/e4/Carmina_Yalensia_-_a_complete_and_accurate_collection_of_Yale_College_songs_-_with_piano_accompaniment_(IA_carminayalensiac00garr).pdf#page=53 . This game uses its repeated-E phrase. This is not the different Lowell Mason setting of 1831.

These historical melody sources predate modern copyright terms. New recordings and arrangements can have separate rights and are not included here.

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
