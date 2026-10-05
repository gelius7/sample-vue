# Bongo Cat · 냥냥 리듬 클럽

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

Run `npm test` for the rhythm timing, scoring, missed-note, and replay checks.

### GitHub Pages

In repository Settings → Pages, select **GitHub Actions** as the source.
The Node CI workflow builds and deploys `master` to
https://gelius7.github.io/sample-vue/ after lint and build pass.
Pull requests are checked but never deployed.

The workflow sets `PUBLIC_PATH=/sample-vue/` for project-site assets.
Local development and ordinary builds continue to use `/`.
A mobile-friendly cat drum game built with Vue 3, original SVG artwork, and Web Audio.
Tap the two pads or use A / L (or arrow keys) to play. Start a 30-second round
and hit each colored note when it reaches the line. Each note scores once;
perfect timing earns 100 points, good timing 70, plus a small combo bonus.
The highest score is saved only on this browser when local storage is available.
Audio starts after a gesture; mute, pause/resume, and free play are supported.
Switching away from the page pauses an active round. No account or backend is used.

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
