// Types for backend API integration — aligned with backend FastAPI responses.

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

// Lightweight status response (GET /status/{job_id})
export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled" | "unknown"

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

// --- Legacy / compatibility types ---
// Some UI code previously used playlist/multi-progress shapes. Keep small, optional
// types here for backward compatibility but prefer the job/status/files flow above.

export interface FileInfo {
  name: string
  size?: number
  path?: string
}

export interface DownloadedFile extends FileInfo {
  folder?: string
}

// Deprecated: multi-file progress structures (prefer JobStatus + meta/files endpoints)
export interface MultiProgressData {
  // minimal shape kept for compatibility
  download_id?: string
  total_files?: number
  completed_files?: number
  failed_files?: number
  overall_progress?: number
  overall_status?: string
  files_info?: FileListItem[]
  error?: string
}

// Health / helper responses (unchanged semantics)
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