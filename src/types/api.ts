// Types for backend API integration — aligned with backend FastAPI responses.
import type { JobStatus as JobStatusType } from "@/src/config/backend"

// --- Requests ---
export interface DownloadRequest {
  url: string
  // optional bitrate in kbps ("192") or "best"; ignored by opus/flac/wav
  quality?: string
  // optional audio format: mp3 (default), m4a, opus, ogg, flac, wav
  format?: string
}

export interface VideoDownloadRequest {
  url: string
  // optional video container/format (e.g. "mp4", "webm", "mov", "avi")
  format?: string
  // optional maximum resolution: "best" (default), "2160p" ... "360p"
  resolution?: string
}

// --- Responses ---
// Response returned when a download job is enqueued (POST /download)
export interface DownloadEnqueueResponse {
  message: string
  job_id: string
  url: string
  source?: string
}

// Lightweight status response (GET /jobs/{job_id})
export type JobStatus = JobStatusType

export interface StatusResponse {
  job_id: string
  status: JobStatus
  // backend may include `meta` when final meta exists
  meta?: Record<string, any>
  // or `log_path` when running
  log_path?: string
}

// File list item returned by GET /files/{job_id}
export interface FileListItem {
  name: string
  size_bytes?: number
  download_url?: string
}

export interface FilesListResponse {
  job_id: string
  files: FileListItem[]
}

// Response returned when requesting the archive endpoint (GET /files/{job_id}/archive)
export interface ZipDownloadResponse {
  success?: boolean
  // URL to download the ZIP (frontend uses proxy /api/files/{jobId}/archive)
  zip_url?: string
  download_url?: string
  file_size?: number
  error?: string
}

// Archive/download endpoints return binary FileResponses and are not modeled here.

// Health / helper responses
export interface HealthCheckResponse {
  status: string
  spotify_auth: boolean
  youtube_available: boolean
  output_directory: boolean
  message?: string
}

export interface QualitiesResponse {
  qualities: Array<{
    value: string
    label: string
    bitrate: string
  }>
}

export interface AudioInfoResponse {
  success: boolean
  metadata?: {
    title?: string
    artist?: string
    duration?: number
    thumbnail?: string
    platform?: string
  }
  error?: string
}

// --- Music library (GET /library/tracks) ---
export interface LibraryTrack {
  id: string
  title: string | null
  artist: string | null
  album: string | null
  duration_s: number | null
  format: string | null
  size_bytes: number
  has_cover: boolean
  // protected from the automatic cleanup
  kept: boolean
}

export interface LibraryListResponse {
  tracks: LibraryTrack[]
  total: number
  limit: number
  offset: number
  kept_bytes: number
}

// UI-specific types
export type DownloadStatus = "idle" | "loading" | "success" | "error" | "info-loading"

export interface ProducedFile {
  name: string
  size_bytes?: number
}

export type BackendStatus = "unknown" | "connected" | "disconnected"

export type TabType = "audio" | "video" | "library"

// Video-specific types
export type VideoJobStatus = "idle" | "loading" | "success" | "error" | "polling"

export interface VideoFile {
  name: string
  size?: number
}