export const QUALITY_OPTIONS = [
  { value: "96", label: "96 kbps", description: "Baja calidad" },
  { value: "128", label: "128 kbps", description: "Calidad estándar" },
  { value: "192", label: "192 kbps", description: "Alta calidad" },
  { value: "320", label: "320 kbps", description: "Máxima calidad" },
] as const

export const DEFAULT_QUALITY = "192"

export const POLLING_INTERVAL = 4000 // ms
export const DOWNLOAD_DELAY = 250 // ms entre descargas múltiples
