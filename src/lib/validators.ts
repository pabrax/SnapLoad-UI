// URL validators aligned with backend heuristics (FastAPI utils)

/** Basic check for Spotify URLs/URIs. */
export function isSpotifyUrl(input: string): boolean {
  if (!input || typeof input !== "string") return false
  const s = input.trim()

  // spotify:track:<id> | spotify:album:<id> | spotify:playlist:<id>
  const spotifyUri = /^spotify:(track|album|playlist):([A-Za-z0-9]{22})$/
  if (spotifyUri.test(s)) return true

  // https://open.spotify.com/(intl-xx/)?(track|album|playlist)/<id>[...?]
  const spotifyUrl = /^https?:\/\/open\.spotify\.com\/(?:[A-Za-z\-]+\/)?(track|album|playlist)\/([A-Za-z0-9]{22})(?:[\/?#].*)?$/
  return spotifyUrl.test(s)
}

/** Basic check for YouTube URLs (www.youtube.com, youtube.com, youtu.be, music.youtube.com). */
export function isYouTubeUrl(input: string): boolean {
  if (!input || typeof input !== "string") return false
  const s = input.trim()
  return (
    s.startsWith("https://www.youtube.com/") ||
    s.startsWith("https://youtube.com/") ||
    s.startsWith("https://youtu.be/") ||
    s.startsWith("https://music.youtube.com/") ||
    s.startsWith("http://www.youtube.com/") ||
    s.startsWith("http://youtube.com/") ||
    s.startsWith("http://youtu.be/")
  )
}

/** True if URL is supported by the backend (Spotify or YouTube). */
export function isValidContentUrl(input: string): boolean {
  return isSpotifyUrl(input) || isYouTubeUrl(input)
}

/**
 * Sanitizes YouTube URLs to prevent unwanted radio/auto-generated playlists.
 * 
 * Rules:
 * - Removes `&list=RD*` and `&list=RDAM*` parameters (radio playlists)
 * - Removes `&start_radio=1` parameter
 * - Only allows explicit playlists with `/playlist?list=` format
 * - Converts `/watch?v=...&list=OLAK5...` to single video if not a playlist URL
 * 
 * @returns Sanitized URL and a warning message if modifications were made
 */
export function sanitizeYouTubeUrl(url: string): { 
  sanitized: string
  wasModified: boolean
  warning?: string 
} {
  if (!isYouTubeUrl(url)) {
    return { sanitized: url, wasModified: false }
  }

  try {
    const urlObj = new URL(url)
    const params = urlObj.searchParams
    let modified = false
    let warning: string | undefined

    // Check if it's a radio playlist (RD or RDAM prefix)
    const listParam = params.get('list')
    if (listParam && (listParam.startsWith('RD') || listParam.startsWith('RDAM'))) {
      params.delete('list')
      params.delete('start_radio')
      params.delete('si')
      modified = true
      warning = 'Se removió una playlist automática de radio. Solo se descargará el video individual.'
    }

    if (params.has('start_radio')) {
      params.delete('start_radio')
      modified = true
    }

    // For /watch URLs with non-radio playlists, keep only the video
    // Only allow playlists from /playlist URLs
    if (urlObj.pathname.includes('/watch') && params.has('list')) {
      const listValue = params.get('list')
      // If it's not explicitly a /playlist URL, remove the list parameter
      if (listValue && !listValue.startsWith('RD')) {
        params.delete('list')
        params.delete('index')
        modified = true
        warning = 'Se removió la referencia a playlist. Solo se descargará el video individual. Para descargar playlists completas, usa URLs del formato: youtube.com/playlist?list=...'
      }
    }

    const sanitized = urlObj.toString()
    
    return {
      sanitized,
      wasModified: modified,
      warning: modified ? warning : undefined
    }
  } catch (error) {
    return { sanitized: url, wasModified: false }
  }
}

/**
 * Checks if a YouTube URL is a valid explicit playlist.
 * Only allows /playlist?list=... format.
 */
export function isYouTubePlaylist(url: string): boolean {
  if (!isYouTubeUrl(url)) return false
  
  try {
    const urlObj = new URL(url)
    return urlObj.pathname.includes('/playlist') && urlObj.searchParams.has('list')
  } catch {
    return false
  }
}

/**
 * Validates that URL is from YouTube only (not Spotify or YouTube Music).
 * For video downloads, we only support regular YouTube (youtube.com, youtu.be).
 * YouTube Music is excluded because it's designed for audio content.
 */
export function isYouTubeVideoUrl(input: string): boolean {
  if (!input || typeof input !== "string") return false
  const s = input.trim()
  
  return (
    (s.startsWith("https://www.youtube.com/") ||
     s.startsWith("https://youtube.com/") ||
     s.startsWith("http://www.youtube.com/") ||
     s.startsWith("http://youtube.com/") ||
     s.startsWith("https://youtu.be/") ||
     s.startsWith("http://youtu.be/")) &&
    !s.includes("music.youtube.com")
  )
}

export function isValidBitrate(quality: string | null | undefined): boolean {
  if (!quality) return false

  const lower = quality.toLowerCase()

  if (lower === "0" || lower === "bestaudio") return true

  // Numeric with optional 'k' suffix (e.g., "320", "320k")
  const match = lower.match(/^(\d+)(k)?$/)
  if (!match) return false

  const value = parseInt(match[1], 10)
  return value > 0 && value <= 500
}

export function validateQuality(quality: string | null | undefined): { valid: boolean; error?: string } {
  if (!quality) return { valid: true }

  if (!isValidBitrate(quality)) {
    return {
      valid: false,
      error: "Calidad inválida; use '0', 'bestaudio' o valores numéricos como '320k' o '128'",
    }
  }

  return { valid: true }
}

import { VALID_VIDEO_FORMATS } from "@/src/config/backend"
import type { VideoFormat } from "@/src/config/backend"

export function isValidVideoFormat(format: string | null | undefined): boolean {
  if (!format || typeof format !== "string") return false
  return VALID_VIDEO_FORMATS.includes(format.toLowerCase() as VideoFormat)
}

/**
 * Validate video format
 * Matches: FormatValidator.validate_format()
 */
export function validateVideoFormat(format: string | null | undefined): { valid: boolean; error?: string } {
  if (!format) return { valid: true } // Optional

  if (!isValidVideoFormat(format)) {
    return {
      valid: false,
      error: `Formato inválido; use uno de: ${VALID_VIDEO_FORMATS.join(", ")}`,
    }
  }

  return { valid: true }
}

// ============================================================================
// File Extension Validation
// ============================================================================

import { AUDIO_EXTENSIONS, VIDEO_EXTENSIONS } from "@/src/config/backend"

/**
 * Check if file has audio extension
 */
export function isAudioFile(filename: string): boolean {
  const lower = filename.toLowerCase()
  return AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext))
}

/**
 * Check if file has video extension
 */
export function isVideoFile(filename: string): boolean {
  const lower = filename.toLowerCase()
  return VIDEO_EXTENSIONS.some(ext => lower.endsWith(ext))
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^.]+$/)
  return match ? match[0].toLowerCase() : ""
}
