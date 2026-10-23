/**
 * Display formatting for library rows. Free of runtime imports so it can be unit tested with `node --test`.
 */
import type { LibraryTrack } from "@/src/types/api"

export interface TrackRow {
  id: string
  title: string
  artist: string
  duration: string
  coverUrl: string | null
  kept: boolean
  // single-line accessible name: "Title – Artist" (artist omitted when unknown)
  label: string
}

const UNKNOWN_TITLE = "Sin título"
const UNKNOWN_ARTIST = "Artista desconocido"

// MIME types as the browser's canPlayType expects them (matches the API's stream Content-Type).
const FORMAT_MIME: Record<string, string> = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  ogg: "audio/ogg; codecs=vorbis",
  opus: "audio/ogg; codecs=opus",
  flac: "audio/flac",
  wav: "audio/wav",
}

export function mimeForFormat(format: string | null | undefined): string | null {
  return (format && FORMAT_MIME[format.toLowerCase()]) || null
}

export function formatDuration(seconds: number | null | undefined): string {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) return "–"
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, "0")
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB", "TB"]
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(1)} ${units[unit]}`
}

export function trackRow(track: LibraryTrack): TrackRow {
  const title = track.title || UNKNOWN_TITLE
  const artist = track.artist || UNKNOWN_ARTIST
  return {
    id: track.id,
    title,
    artist,
    duration: formatDuration(track.duration_s),
    coverUrl: track.has_cover ? `/api/library/${track.id}/cover` : null,
    kept: track.kept,
    label: track.artist ? `${title} – ${track.artist}` : title,
  }
}
