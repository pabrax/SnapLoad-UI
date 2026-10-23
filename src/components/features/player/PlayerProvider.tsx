"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react"
import type { LibraryTrack } from "@/src/types/api"
import { clampSeek, createPlayerReducer, currentTrack, initialPlayerState, type PlayerState } from "@/src/lib/player-reducer"
import { streamUrl } from "@/src/lib/library-client"
import { mimeForFormat, trackRow } from "@/src/lib/library-view"
import { browserStorage, loadPrefs, savePrefs } from "@/src/lib/player-prefs"
import { PlayerIntegration } from "./PlayerIntegration"

// Below this many seconds "previous" goes to the previous track; beyond it, it restarts the current one.
const RESTART_THRESHOLD_S = 3

export interface PlayerApi {
  state: PlayerState
  track: LibraryTrack | null
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  playTracks: (queue: LibraryTrack[], index: number) => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (seconds: number) => void
  setVolume: (value: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  removeTrack: (id: string) => void
  dismissError: () => void
}

const PlayerContext = createContext<PlayerApi | null>(null)

export function usePlayer(): PlayerApi {
  const api = useContext(PlayerContext)
  if (!api) throw new Error("usePlayer must be used inside <PlayerProvider>")
  return api
}

/**
 * Owns the single audio element and the queue state. It lives in the root layout, so playback
 * continues when the user switches tabs or pages.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const reducer = useMemo(() => createPlayerReducer(), [])
  const [state, dispatch] = useReducer(reducer, initialPlayerState)
  const audioRef = useRef<HTMLAudioElement>(null)
  const loadedId = useRef<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [muted, setMuted] = useState(false)
  const [prefsReady, setPrefsReady] = useState(false)
  const [announcement, setAnnouncement] = useState("")

  const track = currentTrack(state)
  const trackId = track?.id ?? null

  const startPlayback = useCallback((audio: HTMLAudioElement) => {
    audio.play()?.catch((error: unknown) => {
      const name = error instanceof DOMException ? error.name : ""
      if (name === "AbortError") return // a newer load replaced this one
      // The browser refused to start (autoplay policy): reflect the real state instead of looping.
      dispatch({ type: name === "NotAllowedError" ? "pause" : "error" })
    })
  }, [])

  // Load (or restart) the current track whenever it, or its restart counter, changes.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!track) {
      audio.pause()
      audio.removeAttribute("src")
      audio.load()
      loadedId.current = null
      setCurrentTime(0)
      setDuration(0)
      return
    }

    const mime = mimeForFormat(track.format)
    if (mime && audio.canPlayType(mime) === "") {
      dispatch({ type: "error" })
      return
    }

    if (loadedId.current !== track.id) {
      audio.src = streamUrl(track.id)
      loadedId.current = track.id
      setCurrentTime(0)
      setDuration(track.duration_s ?? 0)
    } else {
      audio.currentTime = 0
      setCurrentTime(0)
    }
    if (state.playing) startPlayback(audio)
    // `track` and `state.playing` are read from this render on purpose: only a change of track or restart reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, state.nonce])

  // Play/pause requests that do not change the track.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !loadedId.current) return
    if (state.playing) startPlayback(audio)
    else audio.pause()
  }, [state.playing, startPlayback])

  // Preferences: load once on the client, then persist changes.
  useEffect(() => {
    const prefs = loadPrefs(browserStorage())
    setVolumeState(prefs.volume)
    setMuted(prefs.muted)
    if (prefs.repeat !== "off") dispatch({ type: "setRepeat", mode: prefs.repeat })
    if (prefs.shuffle) dispatch({ type: "toggleShuffle" })
    setPrefsReady(true)
  }, [])

  useEffect(() => {
    if (prefsReady) savePrefs(browserStorage(), { volume, muted, repeat: state.repeat, shuffle: state.shuffle })
  }, [prefsReady, volume, muted, state.repeat, state.shuffle])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    audio.muted = muted
  }, [volume, muted])

  // Screen reader announcements: new track, then failures.
  useEffect(() => {
    if (track) setAnnouncement(`Reproduciendo: ${trackRow(track).label}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId])
  useEffect(() => {
    if (state.error) setAnnouncement(state.error)
  }, [state.error])

  const seek = useCallback(
    (seconds: number) => {
      const audio = audioRef.current
      if (!audio || !loadedId.current) return
      const target = clampSeek(seconds, Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration)
      audio.currentTime = target
      setCurrentTime(target)
    },
    [duration],
  )

  const prev = useCallback(() => {
    if (currentTime > RESTART_THRESHOLD_S) seek(0)
    else dispatch({ type: "prev" })
  }, [currentTime, seek])

  const api = useMemo<PlayerApi>(
    () => ({
      state,
      track,
      currentTime,
      duration,
      volume,
      muted,
      playTracks: (queue, index) => dispatch({ type: "play", queue, index }),
      toggle: () => dispatch({ type: "toggle" }),
      next: () => dispatch({ type: "next" }),
      prev,
      seek,
      setVolume: (value) => {
        setVolumeState(Math.min(Math.max(value, 0), 1))
        if (value > 0) setMuted(false)
      },
      toggleMute: () => setMuted((m) => !m),
      toggleShuffle: () => dispatch({ type: "toggleShuffle" }),
      cycleRepeat: () => dispatch({ type: "cycleRepeat" }),
      removeTrack: (id) => dispatch({ type: "remove", id }),
      dismissError: () => dispatch({ type: "dismissError" }),
    }),
    [state, track, currentTime, duration, volume, muted, prev, seek],
  )

  return (
    <PlayerContext.Provider value={api}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlaying={() => dispatch({ type: "started" })}
        onEnded={() => dispatch({ type: "ended" })}
        onError={() => {
          // Ignore the error raised by clearing `src` when the queue empties.
          if (loadedId.current) dispatch({ type: "error" })
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration
          if (Number.isFinite(d) && d > 0) setDuration(d)
        }}
      />
      <PlayerIntegration />
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </PlayerContext.Provider>
  )
}
