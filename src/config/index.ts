/**
 * Backend synchronization module
 * Exports all backend-synchronized configurations, types, and utilities
 */

// Configuration and enums synchronized with backend
export * from "./backend"

// UI Messages
export * from "@/src/constants/messages"

// Error types and handlers
export * from "@/src/types/errors"

// Validation utilities
export {
  isSpotifyUrl,
  isYouTubeUrl,
  isYouTubeVideoUrl,
  isYouTubePlaylist,
  isValidContentUrl,
  sanitizeYouTubeUrl,
  isValidBitrate,
  validateQuality,
  isValidVideoFormat,
  validateVideoFormat,
  isAudioFile,
  isVideoFile,
  getFileExtension,
} from "@/src/lib/validators"

// UI mapping utilities
export {
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  JOB_STATUS_BADGE_VARIANTS,
  isTerminalStatus,
  isSuccessStatus,
  isActiveStatus,
  MEDIA_TYPE_LABELS,
  MEDIA_TYPE_ICONS,
  DOWNLOAD_SOURCE_LABELS,
  DOWNLOAD_SOURCE_COLORS,
  formatFileSize, // @deprecated - Use FILE_MESSAGES.SIZE from messages instead
} from "@/src/lib/backend-utils"
