const assert = require('node:assert/strict')
async function check() {
const { createNotes, judgeHit, expireNotes, ROUND_MS } = await import('../src/rhythm.mjs')

const notes = createNotes()
assert.equal(notes.length, 48)
assert.ok(notes.at(-1).time + 180 < ROUND_MS)
assert.equal(judgeHit(notes, 1, 1200), null, 'wrong pad must not score')
assert.equal(judgeHit(notes, 0, 1019), null, 'early taps must not score')
assert.deepEqual(judgeHit(notes, 0, 1200), { perfect: true })
assert.equal(judgeHit(notes, 0, 1200), null, 'one note cannot score twice')
assert.deepEqual(judgeHit(notes, 1, 1980), { perfect: false }, 'edge of hit window is accepted')
assert.equal(expireNotes(notes, 2580), 0, 'a note remains playable at the edge')
assert.equal(expireNotes(notes, 2581), 1)
assert.equal(expireNotes(notes, 2581), 0, 'misses are counted once')
assert.equal(judgeHit(notes, 0, 2400), null, 'expired notes cannot be scored')
const replay = createNotes()
assert.equal(replay.filter(n => n.hit || n.missed).length, 0, 'replay starts clean')
assert.equal(expireNotes(replay, ROUND_MS), 48)
console.log('Rhythm checks passed: timing, wrong pads, duplicate taps, misses, and replay.')

}
check().catch(error => { console.error(error); process.exitCode = 1 })
