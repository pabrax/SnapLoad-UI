/**
 * UI utilities for backend data mapping
 * Converts backend enums to user-friendly labels and styles
 */

import { JOB_STATUS, MEDIA_TYPE, DOWNLOAD_SOURCE } from "@/src/config/backend"
import type { JobStatus, MediaType, DownloadSource } from "@/src/config/backend"

// ============================================================================
// Job Status Mapping
// ============================================================================

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  [JOB_STATUS.PENDING]: "Pendiente",
  [JOB_STATUS.RUNNING]: "Descargando",
  [JOB_STATUS.SUCCESS]: "Completado",
  [JOB_STATUS.FAILED]: "Fallido",
  [JOB_STATUS.CANCELLED]: "Cancelado",
  [JOB_STATUS.QUEUED]: "En cola",
  [JOB_STATUS.READY]: "Listo",
  [JOB_STATUS.UNKNOWN]: "Desconocido",
}

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  [JOB_STATUS.PENDING]: "text-yellow-600",
  [JOB_STATUS.RUNNING]: "text-blue-600",
  [JOB_STATUS.SUCCESS]: "text-green-600",
  [JOB_STATUS.FAILED]: "text-red-600",
  [JOB_STATUS.CANCELLED]: "text-gray-600",
  [JOB_STATUS.QUEUED]: "text-yellow-500",
  [JOB_STATUS.READY]: "text-green-500",
  [JOB_STATUS.UNKNOWN]: "text-gray-500",
}

export const JOB_STATUS_BADGE_VARIANTS: Record<JobStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [JOB_STATUS.PENDING]: "outline",
  [JOB_STATUS.RUNNING]: "default",
  [JOB_STATUS.SUCCESS]: "default",
  [JOB_STATUS.FAILED]: "destructive",
  [JOB_STATUS.CANCELLED]: "secondary",
  [JOB_STATUS.QUEUED]: "outline",
  [JOB_STATUS.READY]: "default",
  [JOB_STATUS.UNKNOWN]: "secondary",
}

/**
 * Check if job status is terminal (no more changes expected)
 */
export function isTerminalStatus(status: JobStatus): boolean {
  const terminalStatuses: JobStatus[] = [
    JOB_STATUS.SUCCESS,
    JOB_STATUS.FAILED,
    JOB_STATUS.CANCELLED,
    JOB_STATUS.READY,
  ]
  return terminalStatuses.includes(status)
}

/**
 * Check if job status indicates success
 */
export function isSuccessStatus(status: JobStatus): boolean {
  const successStatuses: JobStatus[] = [JOB_STATUS.SUCCESS, JOB_STATUS.READY]
  return successStatuses.includes(status)
}

/**
 * Check if job status indicates active processing
 */
export function isActiveStatus(status: JobStatus): boolean {
  const activeStatuses: JobStatus[] = [JOB_STATUS.RUNNING, JOB_STATUS.PENDING, JOB_STATUS.QUEUED]
  return activeStatuses.includes(status)
}

// ============================================================================
// Media Type Mapping
// ============================================================================

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  [MEDIA_TYPE.AUDIO]: "Audio",
  [MEDIA_TYPE.VIDEO]: "Video",
}

export const MEDIA_TYPE_ICONS: Record<MediaType, string> = {
  [MEDIA_TYPE.AUDIO]: "🎵",
  [MEDIA_TYPE.VIDEO]: "🎥",
}

// ============================================================================
// Download Source Mapping
// ============================================================================

export const DOWNLOAD_SOURCE_LABELS: Record<DownloadSource, string> = {
  [DOWNLOAD_SOURCE.SPOTIFY]: "Spotify",
  [DOWNLOAD_SOURCE.YOUTUBE]: "YouTube",
  [DOWNLOAD_SOURCE.YOUTUBE_AUDIO]: "YouTube (Audio)",
  [DOWNLOAD_SOURCE.YOUTUBE_VIDEO]: "YouTube (Video)",
}

export const DOWNLOAD_SOURCE_COLORS: Record<DownloadSource, string> = {
  [DOWNLOAD_SOURCE.SPOTIFY]: "text-green-600",
  [DOWNLOAD_SOURCE.YOUTUBE]: "text-red-600",
  [DOWNLOAD_SOURCE.YOUTUBE_AUDIO]: "text-red-500",
  [DOWNLOAD_SOURCE.YOUTUBE_VIDEO]: "text-red-700",
}

export function formatFileSize(bytes: number | undefined): string {
  if (!bytes || bytes === 0) return "0 B"
  
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}
