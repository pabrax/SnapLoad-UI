/**
 * Player preferences kept in localStorage. Storage can be missing or throw (private windows, blocked
 * site data), so every access is guarded and the player works without it. Free of imports so it can be
 * unit tested with `node --test`.
 */

export type StoredRepeat = "off" | "all" | "one"

export interface PlayerPrefs {
  volume: number
  muted: boolean
  repeat: StoredRepeat
  shuffle: boolean
}

export interface PrefsStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const KEY = "snapload.player"

export const DEFAULT_PREFS: PlayerPrefs = { volume: 1, muted: false, repeat: "off", shuffle: false }

const isRepeat = (value: unknown): value is StoredRepeat => value === "off" || value === "all" || value === "one"

export function loadPrefs(storage: PrefsStorage | null): PlayerPrefs {
  try {
    const raw = storage?.getItem(KEY)
    if (!raw) return DEFAULT_PREFS
    const data = JSON.parse(raw)
    if (typeof data !== "object" || data === null || Array.isArray(data)) return DEFAULT_PREFS
    return {
      volume: typeof data.volume === "number" && data.volume >= 0 && data.volume <= 1 ? data.volume : DEFAULT_PREFS.volume,
      muted: typeof data.muted === "boolean" ? data.muted : DEFAULT_PREFS.muted,
      repeat: isRepeat(data.repeat) ? data.repeat : DEFAULT_PREFS.repeat,
      shuffle: typeof data.shuffle === "boolean" ? data.shuffle : DEFAULT_PREFS.shuffle,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

export function savePrefs(storage: PrefsStorage | null, prefs: PlayerPrefs): void {
  try {
    storage?.setItem(KEY, JSON.stringify(prefs))
  } catch {
    // Preferences are a convenience; losing them must not affect playback.
  }
}

// `window.localStorage` itself can throw on access, so it is read behind a guard.
export function browserStorage(): PrefsStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}
