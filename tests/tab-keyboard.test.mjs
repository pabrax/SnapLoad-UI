// WAI-ARIA tabs pattern: roving focus with arrows (wrapping), Home and End.
import test from "node:test"
import assert from "node:assert/strict"
import { nextTabIndex } from "../src/lib/tab-keyboard.ts"

test("arrow right/left move and wrap around", () => {
  assert.equal(nextTabIndex("ArrowRight", 0, 2), 1)
  assert.equal(nextTabIndex("ArrowRight", 1, 2), 0)
  assert.equal(nextTabIndex("ArrowLeft", 0, 2), 1)
  assert.equal(nextTabIndex("ArrowLeft", 1, 2), 0)
})

test("home and end jump to the extremes", () => {
  assert.equal(nextTabIndex("Home", 1, 3), 0)
  assert.equal(nextTabIndex("End", 0, 3), 2)
})

test("other keys are ignored so Tab and typing keep working", () => {
  for (const key of ["Tab", "Enter", " ", "a", "ArrowDown", "ArrowUp"]) assert.equal(nextTabIndex(key, 0, 2), null, key)
})

test("empty tab list yields null", () => {
  assert.equal(nextTabIndex("ArrowRight", 0, 0), null)
})
