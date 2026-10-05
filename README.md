# Vue js project sample

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
npm run lint -- --no-fix
npm run build
```

There is no separate automated test suite configured.

### GitHub Pages

In repository Settings → Pages, select **GitHub Actions** as the source.
The Node CI workflow builds and deploys `master` to
https://gelius7.github.io/sample-vue/ after lint and build pass.
Pull requests are checked but never deployed.

The workflow sets `PUBLIC_PATH=/sample-vue/` for project-site assets.
Local development and ordinary builds continue to use `/`.
Form entries are held only in browser memory and reset when the page reloads.

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
