/**
 * Queue, shuffle and repeat logic of the music player. Pure and free of runtime imports so it can be
 * unit tested with `node --test`; the audio element lives in the PlayerProvider, which reacts to
 * `currentTrack`, `playing` and `nonce` (a change of nonce restarts the current track).
 */
import type { LibraryTrack } from "@/src/types/api"

export type RepeatMode = "off" | "all" | "one"

export interface PlayerState {
  queue: LibraryTrack[]
  // playback order as indices into `queue` (identity unless shuffled)
  order: number[]
  // index into `order`; -1 when nothing is selected
  position: number
  repeat: RepeatMode
  shuffle: boolean
  playing: boolean
  // message naming the last track that failed to play
  error: string | null
  // consecutive failures, so a queue of broken files does not skip forever
  errorStreak: number
  // bumped whenever the audio element must (re)load or restart the current track
  nonce: number
}

export type PlayerAction =
  | { type: "play"; queue: LibraryTrack[]; index: number }
  | { type: "toggle" }
  | { type: "pause" }
  | { type: "next" }
  | { type: "prev" }
  | { type: "ended" }
  | { type: "started" }
  | { type: "error" }
  | { type: "dismissError" }
  | { type: "toggleShuffle" }
  | { type: "setRepeat"; mode: RepeatMode }
  | { type: "cycleRepeat" }
  | { type: "remove"; id: string }

export const initialPlayerState: PlayerState = {
  queue: [],
  order: [],
  position: -1,
  repeat: "off",
  shuffle: false,
  playing: false,
  error: null,
  errorStreak: 0,
  nonce: 0,
}

const REPEAT_CYCLE: RepeatMode[] = ["off", "all", "one"]

export function currentTrack(state: PlayerState): LibraryTrack | null {
  if (state.position < 0) return null
  return state.queue[state.order[state.position]] ?? null
}

export function clampSeek(position: number, duration: number): number {
  if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) return 0
  return Math.min(Math.max(position, 0), duration)
}

const identity = (length: number) => Array.from({ length }, (_, i) => i)

// Fisher–Yates over every index except `first`, which (when valid) leads the order.
function shuffledOrder(length: number, first: number, rng: () => number): number[] {
  const rest = identity(length).filter((i) => i !== first)
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[rest[i], rest[j]] = [rest[j], rest[i]]
  }
  return first >= 0 && first < length ? [first, ...rest] : rest
}

// Next position in `order`, wrapping when asked; null at the end of the queue.
function advance(state: PlayerState, wrap: boolean): number | null {
  const length = state.order.length
  if (length === 0) return null
  if (state.position + 1 < length) return state.position + 1
  return wrap ? 0 : null
}

const stopped = (state: PlayerState): PlayerState => ({ ...state, playing: false })

const moveTo = (state: PlayerState, position: number): PlayerState => ({
  ...state,
  position,
  playing: true,
  nonce: state.nonce + 1,
})

export function createPlayerReducer(rng: () => number = Math.random) {
  return function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
    switch (action.type) {
      case "play": {
        const { queue, index } = action
        if (index < 0 || index >= queue.length) return state
        return {
          ...state,
          queue,
          order: state.shuffle ? shuffledOrder(queue.length, index, rng) : identity(queue.length),
          position: state.shuffle ? 0 : index,
          playing: true,
          error: null,
          errorStreak: 0,
          nonce: state.nonce + 1,
        }
      }

      case "toggle":
        return currentTrack(state) ? { ...state, playing: !state.playing } : state

      case "pause":
        return state.playing ? { ...state, playing: false } : state

      case "next": {
        const target = advance(state, state.repeat !== "off")
        return target === null ? state : moveTo(state, target)
      }

      case "prev": {
        if (state.order.length === 0) return state
        if (state.position > 0) return moveTo(state, state.position - 1)
        if (state.repeat !== "off") return moveTo(state, state.order.length - 1)
        return { ...state, playing: true, nonce: state.nonce + 1 } // restart the first track
      }

      case "ended": {
        if (!currentTrack(state)) return state
        if (state.repeat === "one") return { ...state, playing: true, nonce: state.nonce + 1 }
        const target = advance(state, state.repeat === "all")
        return target === null ? stopped(state) : moveTo(state, target)
      }

      case "started":
        return state.errorStreak === 0 ? state : { ...state, errorStreak: 0 }

      case "error": {
        const track = currentTrack(state)
        if (!track) return state
        const failures = state.errorStreak + 1
        const next: PlayerState = {
          ...state,
          error: `No se pudo reproducir «${track.title ?? "Sin título"}»`,
          errorStreak: failures,
        }
        if (failures >= state.order.length) return stopped(next)
        const target = advance(next, state.repeat !== "off")
        return target === null ? stopped(next) : moveTo(next, target)
      }

      case "dismissError":
        return state.error === null ? state : { ...state, error: null }

      case "toggleShuffle": {
        const length = state.queue.length
        const current = state.position >= 0 ? state.order[state.position] : -1
        if (!state.shuffle) {
          return { ...state, shuffle: true, order: shuffledOrder(length, current, rng), position: current >= 0 ? 0 : -1 }
        }
        return { ...state, shuffle: false, order: identity(length), position: current }
      }

      case "setRepeat":
        return { ...state, repeat: action.mode }

      case "cycleRepeat":
        return { ...state, repeat: REPEAT_CYCLE[(REPEAT_CYCLE.indexOf(state.repeat) + 1) % REPEAT_CYCLE.length] }

      case "remove": {
        const removed = state.queue.findIndex((t) => t.id === action.id)
        if (removed < 0) return state

        const queue = state.queue.filter((_, i) => i !== removed)
        const removedPosition = state.order.indexOf(removed)
        const order = state.order.filter((i) => i !== removed).map((i) => (i > removed ? i - 1 : i))
        const base: PlayerState = { ...state, queue, order }

        if (removedPosition < state.position) return { ...base, position: state.position - 1 }
        if (removedPosition > state.position) return base

        // The current track was removed: continue with whatever now sits at its place.
        if (order.length === 0) return { ...base, position: -1, playing: false, nonce: state.nonce + 1 }
        if (state.position < order.length) return { ...base, nonce: state.nonce + 1 }
        if (state.repeat === "all") return { ...base, position: 0, nonce: state.nonce + 1 }
        return { ...base, position: -1, playing: false, nonce: state.nonce + 1 }
      }
    }
  }
}
