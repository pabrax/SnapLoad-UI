// Global keyboard shortcuts of the player (Node runs the .ts directly).
import test from "node:test"
import assert from "node:assert/strict"
import { shortcutAction } from "../src/lib/player-shortcuts.ts"

const key = (k, target = { tagName: "BODY" }, mods = {}) => ({ key: k, target, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods })

test("keys map to player actions", () => {
  assert.equal(shortcutAction(key(" ")), "toggle")
  assert.equal(shortcutAction(key("n")), "next")
  assert.equal(shortcutAction(key("p")), "prev")
  assert.equal(shortcutAction(key("m")), "mute")
  assert.equal(shortcutAction(key("N")), "next") // caps lock
  assert.equal(shortcutAction(key("x")), null)
})

test("ignores_events_from_text_inputs", () => {
  for (const tagName of ["INPUT", "TEXTAREA", "SELECT"]) {
    assert.equal(shortcutAction(key(" ", { tagName })), null, tagName)
    assert.equal(shortcutAction(key("m", { tagName })), null, tagName)
  }
  assert.equal(shortcutAction(key(" ", { tagName: "DIV", isContentEditable: true })), null)
})

test("space on a focused button is left to the button (no double toggle)", () => {
  assert.equal(shortcutAction(key(" ", { tagName: "BUTTON" })), null)
  assert.equal(shortcutAction(key("n", { tagName: "BUTTON" })), "next")
})

test("space on links, tabs and sliders is not hijacked", () => {
  assert.equal(shortcutAction(key(" ", { tagName: "A" })), null)
  assert.equal(shortcutAction(key(" ", { tagName: "DIV", role: "tab" })), null)
  assert.equal(shortcutAction(key(" ", { tagName: "SPAN", role: "slider" })), null)
})

test("browser and OS shortcuts with modifiers are never captured", () => {
  for (const mods of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
    assert.equal(shortcutAction(key("n", undefined, mods)), null)
    assert.equal(shortcutAction(key("m", undefined, mods)), null)
  }
})

test("a missing target does not throw", () => {
  assert.equal(shortcutAction({ key: " ", target: null }), "toggle")
})
