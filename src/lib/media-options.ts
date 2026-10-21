/**
 * Audio/video options offered by the forms. Kept free of imports so it can be unit tested with
 * `node --test`. Mirrors snapLoad-API app/core/media_options.py and app/core/video_options.py.
 */

export type AudioFormat = "mp3" | "m4a" | "opus" | "ogg" | "flac" | "wav"
export type VideoFormat = "webm" | "mp4" | "mkv" | "mov" | "avi"

// "reencoded": the bitrate is applied; "source": the original stream is copied; "lossless": no bitrate
type BitrateMode = "reencoded" | "source" | "lossless"

export const AUDIO_FORMAT_OPTIONS: ReadonlyArray<{
  value: AudioFormat
  label: string
  description: string
  bitrate: BitrateMode
}> = [
  { value: "mp3", label: "MP3", description: "Universal", bitrate: "reencoded" },
  { value: "m4a", label: "M4A (AAC)", description: "Apple / móviles", bitrate: "reencoded" },
  { value: "opus", label: "Opus", description: "Original de YouTube", bitrate: "source" },
  { value: "ogg", label: "OGG Vorbis", description: "Código abierto", bitrate: "reencoded" },
  { value: "flac", label: "FLAC", description: "Sin pérdida", bitrate: "lossless" },
  { value: "wav", label: "WAV", description: "Sin compresión", bitrate: "lossless" },
]

export const AUDIO_BITRATE_OPTIONS: ReadonlyArray<{ value: string; label: string; description: string }> = [
  { value: "best", label: "Mejor disponible", description: "Calidad del original" },
  { value: "320", label: "320 kbps", description: "Archivo más grande" },
  { value: "256", label: "256 kbps", description: "Muy alta" },
  { value: "192", label: "192 kbps", description: "Alta" },
  { value: "160", label: "160 kbps", description: "Buena" },
  { value: "128", label: "128 kbps", description: "Estándar" },
  { value: "96", label: "96 kbps", description: "Ahorra espacio" },
  { value: "64", label: "64 kbps", description: "Mínima" },
]

export const VIDEO_FORMAT_OPTIONS: ReadonlyArray<{ value: VideoFormat; label: string; description: string }> = [
  { value: "webm", label: "WEBM", description: "VP9 + Opus, hasta 4K" },
  { value: "mp4", label: "MP4", description: "H.264 + AAC, máxima compatibilidad" },
  { value: "mkv", label: "MKV", description: "Máxima calidad, cualquier códec" },
  { value: "mov", label: "MOV", description: "QuickTime, H.264 hasta 1080p" },
  { value: "avi", label: "AVI", description: "H.264 hasta 1080p, algunos reproductores no lo abren" },
]

export const VIDEO_RESOLUTION_OPTIONS: ReadonlyArray<{ value: string; label: string; height: number | null }> = [
  { value: "best", label: "Mejor disponible", height: null },
  { value: "2160p", label: "2160p (4K)", height: 2160 },
  { value: "1440p", label: "1440p (2K)", height: 1440 },
  { value: "1080p", label: "1080p (Full HD)", height: 1080 },
  { value: "720p", label: "720p (HD)", height: 720 },
  { value: "480p", label: "480p", height: 480 },
  { value: "360p", label: "360p", height: 360 },
]

// mov/avi are produced by copying H.264 + AAC streams, and YouTube only offers H.264 up to 1080p.
const MAX_HEIGHT: Partial<Record<string, number>> = { mov: 1080, avi: 1080 }

export const DEFAULT_AUDIO_FORMAT: AudioFormat = "mp3"
export const DEFAULT_VIDEO_RESOLUTION = "best"

function audioMode(format: string): BitrateMode {
  return AUDIO_FORMAT_OPTIONS.find((f) => f.value === format)?.bitrate ?? "reencoded"
}

export function bitrateApplies(format: string): boolean {
  return audioMode(format) === "reencoded"
}

export function bitrateNote(format: string): string | null {
  switch (audioMode(format)) {
    case "lossless":
      return "Formato sin pérdida: el bitrate no aplica. El archivo es grande y no mejora el audio original de la fuente."
    case "source":
      return "Se conserva el stream original de YouTube sin recodificar, por eso no hay bitrate que elegir."
    default:
      return null
  }
}

export function describeAudioQuality(quality: string, format: string): string {
  const mode = audioMode(format)
  if (mode === "lossless") return "Sin pérdida"
  if (mode === "source") return "Stream original"
  if (quality === "best") return "Mejor calidad"
  return `${quality} kbps`
}

export function availableResolutions(format: string) {
  const max = MAX_HEIGHT[format]
  return VIDEO_RESOLUTION_OPTIONS.filter((r) => !max || r.height === null || r.height <= max)
}

export function clampResolution(format: string, resolution: string): string {
  return availableResolutions(format).some((r) => r.value === resolution) ? resolution : "1080p"
}
