// Queue, shuffle and repeat logic of the player (Node runs the .ts directly).
import test from "node:test"
import assert from "node:assert/strict"
import { createPlayerReducer, initialPlayerState, currentTrack, clampSeek } from "../src/lib/player-reducer.ts"

const track = (id) => ({ id, title: `Title ${id}`, artist: null, album: null, duration_s: 100, format: "mp3", size_bytes: 1, has_cover: false, kept: true })
const LIST = ["a", "b", "c", "d"].map(track)

// Deterministic RNG cycling through the given values.
const rngFrom = (values) => {
  let i = 0
  return () => values[i++ % values.length]
}

const run = (reducer, state, ...actions) => actions.reduce(reducer, state)
const ids = (state) => state.order.map((i) => state.queue[i].id)

test("play_sets_current_and_queue_from_list", () => {
  const reducer = createPlayerReducer()

  const state = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 2 })

  assert.equal(currentTrack(state).id, "c")
  assert.equal(state.playing, true)
  assert.deepEqual(state.queue.map((t) => t.id), ["a", "b", "c", "d"])
})

test("nothing is current before the first play", () => {
  assert.equal(currentTrack(initialPlayerState), null)
})

test("toggle pauses and resumes, and does nothing without a track", () => {
  const reducer = createPlayerReducer()
  assert.equal(reducer(initialPlayerState, { type: "toggle" }).playing, false)

  const playing = reducer(initialPlayerState, { type: "play", queue: LIST, index: 0 })
  const paused = reducer(playing, { type: "toggle" })
  assert.equal(paused.playing, false)
  assert.equal(reducer(paused, { type: "toggle" }).playing, true)
})

test("ended advances to the next track and stops at the end with repeat off", () => {
  const reducer = createPlayerReducer()
  let state = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 2 }, { type: "ended" })
  assert.equal(currentTrack(state).id, "d")
  assert.equal(state.playing, true)

  state = reducer(state, { type: "ended" })
  assert.equal(currentTrack(state).id, "d")
  assert.equal(state.playing, false)
})

test("repeat_all_wraps_to_first", () => {
  const reducer = createPlayerReducer()
  const state = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 3 }, { type: "setRepeat", mode: "all" }, { type: "ended" })

  assert.equal(currentTrack(state).id, "a")
  assert.equal(state.playing, true)
})

test("repeat_one_restarts_same", () => {
  const reducer = createPlayerReducer()
  const before = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 1 }, { type: "setRepeat", mode: "one" })

  const after = reducer(before, { type: "ended" })

  assert.equal(currentTrack(after).id, "b")
  assert.equal(after.playing, true)
  assert.notEqual(after.nonce, before.nonce) // the provider restarts the audio element on a nonce change
})

test("cycleRepeat goes off -> all -> one -> off", () => {
  const reducer = createPlayerReducer()
  const modes = []
  let state = initialPlayerState
  for (let i = 0; i < 3; i++) {
    state = reducer(state, { type: "cycleRepeat" })
    modes.push(state.repeat)
  }
  assert.deepEqual(modes, ["all", "one", "off"])
})

test("manual next and prev respect the ends", () => {
  const reducer = createPlayerReducer()
  const first = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 0 })

  const stuckAtStart = reducer(first, { type: "prev" })
  assert.equal(currentTrack(stuckAtStart).id, "a")
  assert.notEqual(stuckAtStart.nonce, first.nonce) // prev on the first track restarts it

  const last = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 3 })
  assert.equal(currentTrack(reducer(last, { type: "next" })).id, "d")

  const wrapped = run(reducer, last, { type: "setRepeat", mode: "all" }, { type: "next" })
  assert.equal(currentTrack(wrapped).id, "a")
  assert.equal(currentTrack(run(reducer, first, { type: "setRepeat", mode: "all" }, { type: "prev" })).id, "d")
})

test("shuffle_plays_each_once_then_stops (injected RNG)", () => {
  const reducer = createPlayerReducer(rngFrom([0.1, 0.9, 0.5, 0.3]))
  let state = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 1 }, { type: "toggleShuffle" })

  assert.equal(state.shuffle, true)
  assert.equal(currentTrack(state).id, "b") // the playing track stays current when shuffle turns on
  const played = [currentTrack(state).id]
  while (state.playing) {
    state = reducer(state, { type: "ended" })
    if (state.playing) played.push(currentTrack(state).id)
  }

  assert.deepEqual([...played].sort(), ["a", "b", "c", "d"]) // each exactly once
  assert.equal(new Set(played).size, 4)
  assert.notDeepEqual(played, ["b", "c", "d", "a"]) // order was actually permuted
})

test("shuffle with repeat all keeps going past the last track", () => {
  const reducer = createPlayerReducer(rngFrom([0.2, 0.7]))
  let state = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 0 }, { type: "toggleShuffle" }, { type: "setRepeat", mode: "all" })
  for (let i = 0; i < 9; i++) state = reducer(state, { type: "ended" })
  assert.equal(state.playing, true)
})

test("turning shuffle off restores queue order around the current track", () => {
  const reducer = createPlayerReducer(rngFrom([0.1, 0.9, 0.5]))
  const shuffled = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 2 }, { type: "toggleShuffle" })

  const restored = reducer(shuffled, { type: "toggleShuffle" })

  assert.equal(restored.shuffle, false)
  assert.deepEqual(ids(restored), ["a", "b", "c", "d"])
  assert.equal(currentTrack(restored).id, "c")
})

test("error_skips_to_next_and_reports_track", () => {
  const reducer = createPlayerReducer()
  const state = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 0 }, { type: "error" })

  assert.equal(currentTrack(state).id, "b")
  assert.equal(state.playing, true)
  assert.match(state.error, /Title a/)
})

test("errors on every track stop playback instead of looping forever", () => {
  const reducer = createPlayerReducer()
  let state = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 0 }, { type: "setRepeat", mode: "all" })
  for (let i = 0; i < 10; i++) state = reducer(state, { type: "error" })

  assert.equal(state.playing, false)
  assert.match(state.error, /Title/)
})

test("a started track resets the error streak but the message stays until dismissed", () => {
  // The next track starts right after the skip, so clearing the message there would make it unreadable.
  const reducer = createPlayerReducer()
  const state = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 0 }, { type: "error" }, { type: "started" })

  assert.equal(state.errorStreak, 0)
  assert.match(state.error, /Title a/)
  assert.equal(reducer(state, { type: "dismissError" }).error, null)
})

test("playing a track on purpose clears a previous error", () => {
  const reducer = createPlayerReducer()
  const failed = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 0 }, { type: "error" })

  assert.equal(reducer(failed, { type: "play", queue: LIST, index: 2 }).error, null)
})

test("remove_current_advances_or_stops", () => {
  const reducer = createPlayerReducer()
  const playing = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 1 })

  const afterMiddle = reducer(playing, { type: "remove", id: "b" })
  assert.equal(currentTrack(afterMiddle).id, "c")
  assert.equal(afterMiddle.playing, true)
  assert.deepEqual(afterMiddle.queue.map((t) => t.id), ["a", "c", "d"])

  const last = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 3 })
  const afterLast = reducer(last, { type: "remove", id: "d" })
  assert.equal(afterLast.playing, false)
  assert.equal(currentTrack(afterLast), null)

  const only = run(reducer, initialPlayerState, { type: "play", queue: [track("x")], index: 0 }, { type: "remove", id: "x" })
  assert.equal(only.playing, false)
  assert.equal(currentTrack(only), null)
})

test("removing a track before the current one keeps the current track", () => {
  const reducer = createPlayerReducer()
  const state = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 2 }, { type: "remove", id: "a" })

  assert.equal(currentTrack(state).id, "c")
  assert.equal(state.playing, true)
})

test("removing an unknown id changes nothing", () => {
  const reducer = createPlayerReducer()
  const state = run(reducer, initialPlayerState, { type: "play", queue: LIST, index: 0 })
  assert.equal(reducer(state, { type: "remove", id: "nope" }), state)
})

test("seek_clamps", () => {
  assert.equal(clampSeek(-5, 100), 0)
  assert.equal(clampSeek(50, 100), 50)
  assert.equal(clampSeek(500, 100), 100)
  assert.equal(clampSeek(10, 0), 0)
  assert.equal(clampSeek(NaN, 100), 0)
  assert.equal(clampSeek(10, NaN), 0)
})
