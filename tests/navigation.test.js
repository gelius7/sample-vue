const assert = require('node:assert/strict')
const fs = require('node:fs')
const source = fs.readFileSync('src/App.vue', 'utf8').split('<script setup>')[1].split('</script>')[0].replace(/^import .+$/gm, '')
const games = [{ id: 'bongo', component: {} }, { id: 'watermelon', component: {} }]
const mounts = [], unmounts = []
let listener, hash = '#bongo'
const location = { get hash() { return hash }, set hash(value) { hash = value && !value.startsWith('#') ? '#' + value : value } }
const window = { location, scrollTo() {}, addEventListener: (event, fn) => { listener = fn }, removeEventListener: (event, fn) => { assert.equal(listener, fn); listener = null } }
const args = { games, window, ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }), onMounted: fn => mounts.push(fn), onUnmounted: fn => unmounts.push(fn) }
const app = new Function(...Object.keys(args), source + '\nreturn { currentGame, openGame, goHome };')(...Object.values(args))
mounts.forEach(fn => fn())
assert.equal(app.currentGame.value.id, 'bongo', 'direct game links open the right game')
app.openGame('watermelon'); listener()
assert.equal(app.currentGame.value.id, 'watermelon')
app.goHome(); listener()
assert.equal(app.currentGame.value, undefined)
window.location.hash = '#bongo'; listener()
assert.equal(app.currentGame.value.id, 'bongo', 'history/hash changes select the right game')
window.location.hash = '#unknown'; listener()
assert.equal(app.currentGame.value, undefined, 'unknown links safely show home')
unmounts.forEach(fn => fn())
assert.equal(listener, null)
assert.match(fs.readFileSync('src/App.vue', 'utf8'), /:key="currentGame.id"/, 'game switches remount independent components')
console.log('Game navigation passed: direct links, switching, home, history changes, unknown links, and cleanup.')
