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

- **냥냥 리듬 클럽** (`#bongo`): original SVG cat, five colored touch/keyboard percussion pads (A/S/D/K/L), and 12 songs. Choose a difficulty category, then one of its songs: difficulty belongs to the music, not a second setting on the same song. Easy nursery songs use two or three pads; the classical and electronic tracks introduce more pads, rests, offbeats, and faster runs. Every synthesized target follows an actual melody onset and its lanes follow pitch height and melodic contour, retaining repeated pitches when playable and using nearby pads for fast repetitions. The three recorded tracks keep their groove-aligned timing and use hand-authored phrase/accent lane motifs; they are not automatic pitch transcriptions. All songs share ±150 ms Good and ±70 ms Perfect timing with the original per-difficulty falling speed. The falling-note field itself fills roughly 80% of the viewport at phone, tablet and desktop widths, in ready, playing and paused states alike. The studio uses a compact cat/header and on-screen pads; its lane never shrinks back to the former 86–190 px strips. The lane normally keeps a 320 px minimum; short landscape windows use the same compact controls in every state so the pads remain reachable. A taller field adds look-ahead time and a matching audio/chart count-in; resizing never accelerates the notes. Choose 1×, 2×, 4× or 8× note-scroll speed before starting; only pixels/second and the matching count-in change, never audio tempo, chart rhythm or scoring windows. Changing this setting resets the round. The selected rate stays visible in the play header. No faster filler grid is overlaid on a slow melody. Perfect earns 100 points, Good 70, plus a small combo bonus. A wrong button or an out-of-window press during the music deducts 50 points, clamped at zero; count-in/free play/pause/finished input is penalty-free. The feedback shows the actual deduction when fewer than 50 points remain. Held key repeats and the click after a touch/pointer press are ignored. Browser-only records use `bongo-cat-best-v6-{song}`; older chart records are left untouched and never misattributed. Changing category/song resets the round and cancels audio, timers, and animation.
- **수박 만들기** (`#watermelon`): drop and combine matching fruits into larger ones, with score, best score, pause, restart, and overflow game over. Original canvas artwork and lightweight local physics.

No account, tracking, server, or game API is used. Three credited, licensed recordings are served locally with the app; other songs are synthesized in Web Audio. Short nursery tunes last their natural 17–28 seconds. Classical selections now follow complete score forms with contrasting episodes and cadences, rather than repeating an excerpt to fill time. Electrodoodle and Disco Medusae play from the original beginning through the ending; EDM Detection Mode is explicitly the opening four-minute excerpt. No music exceeds 240 seconds. Count-in and the brief result tail are additional, and the picker labels the music length explicitly. Sound only starts after a gesture. Mute, pause/resume, and replay are supported. Recordings (about 2.6–3.9 MB each, 128 kbps) are fetched on first play. Only the current song’s decoded buffer is cached; changing songs releases the previous buffer, and versioned filenames prevent an old short audio clip being reused. Same-song replay uses the cache; pause/resume seeks to the matching chart position. Failed loads can be retried, and late load completion cannot start a different song or revive a backgrounded/unmounted game. Switching away from the page pauses a round; leaving a game destroys its state and stops its audio/animation/listeners.

## Adding another game

1. Create a self-contained Vue component under `src/components/` with scoped styles.
2. Add its import and card metadata to `src/games.js`.
3. Clean up animation frames, audio, timers, and global listeners in `onUnmounted`. Handle page visibility where gameplay needs pausing.
4. Add a focused check under `tests/` and include it in `npm test`.

`App.vue` owns only the game picker and hash navigation (including browser Back/Forward). The selected component is keyed and unmounted on game changes; there is no shared mutable game state or plugin framework. The home card artwork has a generic fallback for new entries; customize it if desired.

## Music forms, sources and rights

See [the full score/source credits](public/music-sources/CREDITS.md) and [recorded-music credits](public/audio/CREDITS.md). The in-game picker identifies complete tunes, themes, movements and excerpts separately.

- Twinkle (27.69 s), Frère Jacques (17.14 s), and Mary (16.55 s) each play one complete familiar tune/stanza. Mary retains an explicitly documented straight-beat adaptation of the historical repeated-E contour.
- Ode to Joy (29.09 s) is the complete first 16-bar sung theme, including its contrasting bridge, return, tied note and cadence. It is not presented as the whole symphony.
- Für Elise (156.25 s) and Rondo alla turca (223.50 s) use complete, explicitly public-domain Mutopia editions, with both staves, actual written repeats/alternate endings and codas. Downloaded MIDI repeat behavior was corrected against the score.
- Spring (223.98 s at the existing practice tempo 88) contains the entire first Allegro and all five parts, following the CC BY-SA 3.0 Mutopia edition. The adapted score data retains that license.
- William Tell (198.95 s) contains the complete final Allegro vivace/galop, not the entire four-part overture. Its 16-part Midica transcription and adapted data remain MPL-2.0, with editable notation, notices, license and 22 verified flute-octave corrections supplied.
- Can-can (143.33 s) is a complete formal primary-melody reduction of the historical Galop infernal number, including introduction, contrasting choruses and coda. Inner accompaniment and grace ornaments are omitted and clearly identified.
- Kevin MacLeod's Electrodoodle (166.06 s) and Disco Medusae (221.28 s) retain their complete original recordings. EDM Detection Mode is the uninterrupted original opening 0–240 s, ending at a section boundary and labeled as an excerpt. All three retain CC BY 4.0.

The game does not create extra whole-tune loops or silent padding to meet a length target. Written musical repeats remain part of the genuine form. Music duration excludes the viewport-dependent visual count-in and 700 ms result tail. Source checks do not claim an audio listening audition.

The repository's MIT license covers its original game code; it does not override the music/score-specific licenses. Read [NOTICE](public/music-sources/NOTICE.txt), the included [MPL-2.0 text](public/music-sources/MPL-2.0.txt), [CC BY-SA 3.0 terms](https://creativecommons.org/licenses/by-sa/3.0/), and [CC BY 4.0 terms](https://creativecommons.org/licenses/by/4.0/).

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
