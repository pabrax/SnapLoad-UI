"use client"

import { useEffect, useRef } from "react"
import { coverUrl } from "@/src/lib/library-client"
import { shortcutAction } from "@/src/lib/player-shortcuts"
import { usePlayer } from "./PlayerProvider"

const SEEK_STEP_S = 10

/** Connects the player with the OS (media keys, lock screen) and the keyboard. Renders nothing. */
export function PlayerIntegration() {
  const player = usePlayer()
  const { track, state, duration } = player
  // Handlers read the latest player API without re-registering on every time update.
  const apiRef = useRef(player)
  apiRef.current = player

  const trackId = track?.id ?? null
  const hasMediaSession = typeof navigator !== "undefined" && "mediaSession" in navigator

  // Now playing metadata
  useEffect(() => {
    if (!hasMediaSession) return
    if (!track) {
      navigator.mediaSession.metadata = null
      return
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title ?? "Sin título",
      artist: track.artist ?? "",
      album: track.album ?? "",
      artwork: track.has_cover ? [{ src: coverUrl(track.id), sizes: "512x512", type: "image/jpeg" }] : [],
    })
    // Only the identity of the track matters here, not the object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, hasMediaSession])

  useEffect(() => {
    if (hasMediaSession) navigator.mediaSession.playbackState = !track ? "none" : state.playing ? "playing" : "paused"
  }, [track, state.playing, hasMediaSession])

  useEffect(() => {
    if (!hasMediaSession || !track || !(duration > 0)) return
    try {
      navigator.mediaSession.setPositionState({ duration, position: Math.min(apiRef.current.currentTime, duration), playbackRate: 1 })
    } catch {
      // Some browsers reject inconsistent positions; the lock screen just shows no progress then.
    }
  }, [trackId, duration, state.playing, hasMediaSession, track])

  // Media keys / lock screen controls
  useEffect(() => {
    if (!hasMediaSession) return
    const session = navigator.mediaSession
    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ["play", () => { if (!apiRef.current.state.playing) apiRef.current.toggle() }],
      ["pause", () => { if (apiRef.current.state.playing) apiRef.current.toggle() }],
      ["previoustrack", () => apiRef.current.prev()],
      ["nexttrack", () => apiRef.current.next()],
      ["seekto", (details) => { if (typeof details.seekTime === "number") apiRef.current.seek(details.seekTime) }],
      ["seekbackward", (details) => apiRef.current.seek(apiRef.current.currentTime - (details.seekOffset ?? SEEK_STEP_S))],
      ["seekforward", (details) => apiRef.current.seek(apiRef.current.currentTime + (details.seekOffset ?? SEEK_STEP_S))],
    ]
    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler)
      } catch {
        // Action not supported by this browser.
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          session.setActionHandler(action, null)
        } catch {
          // ignore
        }
      }
    }
  }, [hasMediaSession])

  // Keyboard shortcuts (never while typing; see player-shortcuts)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!apiRef.current.track) return
      const action = shortcutAction({
        key: event.key,
        target: event.target as HTMLElement | null,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
      })
      if (!action) return
      event.preventDefault() // stops Space from scrolling the page
      const api = apiRef.current
      if (action === "toggle") api.toggle()
      else if (action === "next") api.next()
      else if (action === "prev") api.prev()
      else api.toggleMute()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return null
}
