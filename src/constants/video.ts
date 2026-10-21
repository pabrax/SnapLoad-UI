import type { VideoFormat } from "@/src/config/backend"
import { VIDEO_FORMAT_OPTIONS, VIDEO_RESOLUTION_OPTIONS, DEFAULT_VIDEO_RESOLUTION } from "@/src/lib/media-options"

export const VIDEO_FORMATS = VIDEO_FORMAT_OPTIONS
export const VIDEO_RESOLUTIONS = VIDEO_RESOLUTION_OPTIONS
export { DEFAULT_VIDEO_RESOLUTION }

export const DEFAULT_VIDEO_FORMAT: VideoFormat = "webm"
