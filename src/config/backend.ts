/**
 * Backend configuration synchronized with snapLoad-API
 * Matches: app/core/config.py and app/core/enums.py
 */

// ============================================================================
// File Extensions (matches Settings.AUDIO_EXTENSIONS, VIDEO_EXTENSIONS)
// ============================================================================
export const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".flac", ".wav", ".aac", ".ogg"] as const
export const VIDEO_EXTENSIONS = [".webm", ".mp4", ".mkv", ".mov", ".avi"] as const

export type AudioExtension = typeof AUDIO_EXTENSIONS[number]
export type VideoExtension = typeof VIDEO_EXTENSIONS[number]

// ============================================================================
// Valid Formats (matches Settings.VALID_VIDEO_FORMATS)
// ============================================================================
export const VALID_VIDEO_FORMATS = ["webm", "mp4", "mkv", "mov", "avi"] as const
export type VideoFormat = typeof VALID_VIDEO_FORMATS[number]

// ============================================================================
// Job Status (matches JobStatus enum)
// ============================================================================
export const JOB_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
  QUEUED: "queued",
  READY: "ready",
  UNKNOWN: "unknown",
} as const

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS]

// ============================================================================
// Media Type (matches MediaType enum)
// ============================================================================
export const MEDIA_TYPE = {
  AUDIO: "audio",
  VIDEO: "video",
} as const

export type MediaType = typeof MEDIA_TYPE[keyof typeof MEDIA_TYPE]

// ============================================================================
// Download Source (matches DownloadSource enum)
// ============================================================================
export const DOWNLOAD_SOURCE = {
  SPOTIFY: "spotify",
  YOUTUBE: "youtube",
  YOUTUBE_AUDIO: "youtube_audio",
  YOUTUBE_VIDEO: "youtube_video",
} as const

export type DownloadSource = typeof DOWNLOAD_SOURCE[keyof typeof DOWNLOAD_SOURCE]

// ============================================================================
// Cache Status (matches CacheStatus enum)
// ============================================================================
export const CACHE_STATUS = {
  HIT: "ready",
  MISS: "miss",
  PENDING: "pending",
} as const

export type CacheStatus = typeof CACHE_STATUS[keyof typeof CACHE_STATUS]

// ============================================================================
// Configuration Values (matches Settings)
// ============================================================================
export const CONFIG = {
  MAX_FILENAME_LENGTH: 150,
  JOB_TERMINATION_TIMEOUT: 5000, // ms (backend uses 5.0 seconds)
  MAX_LOG_LINES: 200,
} as const

// ============================================================================
// API Info
// ============================================================================
export const API_INFO = {
  TITLE: "SnapLoad API",
  DESCRIPTION: "REST API for downloading media from YouTube and Spotify using yt-dlp and spotdl",
  VERSION: "1.0.0",
} as const
