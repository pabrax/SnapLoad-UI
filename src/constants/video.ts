import { VALID_VIDEO_FORMATS, type VideoFormat } from "@/src/config/backend"

export const VIDEO_FORMATS = VALID_VIDEO_FORMATS.map(format => ({
  value: format,
  label: format.toUpperCase(),
}))

export const DEFAULT_VIDEO_FORMAT: VideoFormat = "webm"
