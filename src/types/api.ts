// Types for backend API integration — aligned with backend FastAPI responses.
import type { JobStatus as JobStatusType } from "@/src/config/backend"

// --- Requests ---
export interface DownloadRequest {
  url: string
  // optional audio quality (e.g. "320k" or yt-dlp quality like "0")
  quality?: string
}

export interface VideoDownloadRequest {
  url: string
  // optional video container/format (e.g. "mp4", "webm")
  format?: string
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

// UI-specific types
export type DownloadStatus = "idle" | "loading" | "success" | "error" | "info-loading"

export interface ProducedFile {
  name: string
  size_bytes?: number
}

export type BackendStatus = "unknown" | "connected" | "disconnected"

export type TabType = "audio" | "video"

// Video-specific types
export type VideoJobStatus = "idle" | "loading" | "success" | "error" | "polling"

export interface VideoFile {
  name: string
  size?: number
}