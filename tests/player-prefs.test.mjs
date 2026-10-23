// Player preferences persisted in localStorage (Node runs the .ts directly).
import test from "node:test"
import assert from "node:assert/strict"
import { DEFAULT_PREFS, loadPrefs, savePrefs } from "../src/lib/player-prefs.ts"

const memoryStorage = (initial = {}) => {
  const data = { ...initial }
  return { data, getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v) } }
}
const throwing = { getItem() { throw new Error("blocked") }, setItem() { throw new Error("blocked") } }

test("defaults when nothing is stored", () => {
  assert.deepEqual(loadPrefs(memoryStorage()), DEFAULT_PREFS)
  assert.deepEqual(DEFAULT_PREFS, { volume: 1, muted: false, repeat: "off", shuffle: false })
})

test("saved preferences round-trip", () => {
  const storage = memoryStorage()
  savePrefs(storage, { volume: 0.4, muted: true, repeat: "all", shuffle: true })
  assert.deepEqual(loadPrefs(storage), { volume: 0.4, muted: true, repeat: "all", shuffle: true })
})

test("garbage, partial and out-of-range values fall back field by field", () => {
  assert.deepEqual(loadPrefs(memoryStorage({ "snapload.player": "{not json" })), DEFAULT_PREFS)
  assert.deepEqual(loadPrefs(memoryStorage({ "snapload.player": "[1,2]" })), DEFAULT_PREFS)
  assert.deepEqual(
    loadPrefs(memoryStorage({ "snapload.player": JSON.stringify({ volume: 7, muted: "yes", repeat: "sideways", shuffle: true }) })),
    { volume: 1, muted: false, repeat: "off", shuffle: true },
  )
  assert.equal(loadPrefs(memoryStorage({ "snapload.player": JSON.stringify({ volume: -1 }) })).volume, 1)
})

test("blocked or missing storage never throws", () => {
  assert.deepEqual(loadPrefs(throwing), DEFAULT_PREFS)
  assert.doesNotThrow(() => savePrefs(throwing, DEFAULT_PREFS))
  assert.deepEqual(loadPrefs(null), DEFAULT_PREFS)
  assert.doesNotThrow(() => savePrefs(null, DEFAULT_PREFS))
})
