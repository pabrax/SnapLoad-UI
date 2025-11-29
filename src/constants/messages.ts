/**
 * UI Messages - Mensajes claros y específicos para la interfaz
 * Organizados por contexto y tipo de mensaje
 */

// ============================================================================
// Estados de Descarga
// ============================================================================

export const DOWNLOAD_MESSAGES = {
  // Estados iniciales
  IDLE: {
    AUDIO: "Pega la URL de YouTube o Spotify para descargar audio",
    VIDEO: "Pega la URL de YouTube para descargar video",
  },
  
  // Validación
  VALIDATION: {
    EMPTY_URL: "Ingresa una URL válida",
    INVALID_URL: "La URL debe ser de YouTube o Spotify",
    INVALID_YOUTUBE: "Ingresa una URL válida de YouTube",
    INVALID_SPOTIFY: "Ingresa una URL válida de Spotify",
    INVALID_QUALITY: "Selecciona una calidad válida (96k, 128k, 192k, 320k)",
    INVALID_FORMAT: "Selecciona un formato válido (webm, mp4, mkv)",
  },
  
  // Procesamiento
  PROCESSING: {
    FETCHING_INFO: "Obteniendo información...",
    CHECKING_CACHE: "Verificando disponibilidad...",
    QUEUED: "En cola de descarga",
    DOWNLOADING: "Descargando desde YouTube",
    DOWNLOADING_SPOTIFY: "Descargando desde Spotify",
    CONVERTING: "Convirtiendo audio",
    FINALIZING: "Finalizando descarga",
    PLAYLIST_PROCESSING: "Procesando playlist",
    PLAYLIST_ITEM: (current: number, total: number) => 
      `Descargando ${current} de ${total} canciones`,
  },
  
  // Éxito
  SUCCESS: {
    AUDIO_SINGLE: "¡Audio descargado!",
    AUDIO_PLAYLIST: (count: number) => `¡${count} canciones descargadas!`,
    VIDEO_SINGLE: "¡Video descargado!",
    FILE_READY: "Tu archivo está listo",
    AUTO_DOWNLOAD: "El archivo se descargó automáticamente",
    MANUAL_DOWNLOAD: "Haz clic en el botón para descargar",
  },
  
  // Acciones
  ACTIONS: {
    DOWNLOAD_SINGLE: "Descargar archivo",
    DOWNLOAD_ALL: "Descargar todo como ZIP",
    DOWNLOAD_AGAIN: "Descargar de nuevo",
    RETRY: "Reintentar descarga",
    CANCEL: "Cancelar descarga",
    CLEAR: "Nueva descarga",
    GET_INFO: "Ver información",
  },
  
  // Errores específicos
  ERRORS: {
    NETWORK: "Sin conexión a internet. Verifica tu red.",
    SERVER_DOWN: "Servidor no disponible. Intenta más tarde.",
    NOT_FOUND: "Contenido no encontrado. Verifica la URL.",
    RESTRICTED: "Contenido restringido o privado",
    RATE_LIMIT: "Demasiadas solicitudes. Espera un momento.",
    INVALID_FORMAT: "Formato no soportado",
    DOWNLOAD_FAILED: "Error al descargar. Verifica la URL.",
    CONVERSION_FAILED: "Error al convertir el audio",
    PLAYLIST_FAILED: "Error al procesar la playlist",
    TIMEOUT: "La descarga tardó demasiado. Intenta de nuevo.",
    GENERIC: "Ocurrió un error. Intenta nuevamente.",
  },
} as const

// ============================================================================
// Notificaciones Toast
// ============================================================================

export const TOAST_MESSAGES = {
  // URL modificada
  URL_SANITIZED: {
    title: "URL ajustada",
    description: "Se removió contenido de playlist automática",
  },
  
  URL_PLAYLIST_REMOVED: {
    title: "URL ajustada",
    description: "Solo se descargará el video individual. Para playlists, usa URLs de formato: youtube.com/playlist?list=...",
  },
  
  // Descarga iniciada
  DOWNLOAD_STARTED: {
    title: "Descarga iniciada",
    description: "Tu archivo se está procesando",
  },
  
  // Descarga cancelada
  DOWNLOAD_CANCELLED: {
    title: "Descarga cancelada",
    description: "La descarga se detuvo correctamente",
  },
  
  // Playlist
  PLAYLIST_STARTED: {
    title: "Playlist en proceso",
    description: "Se están descargando las canciones",
  },
  
  PLAYLIST_CANCELLED: {
    title: "Playlist cancelada",
    description: "La descarga de la playlist se detuvo",
  },
  
  // Cache
  CACHE_HIT: {
    title: "¡Disponible!",
    description: "Este contenido ya está descargado",
  },
  
  // Backend
  BACKEND_OFFLINE: {
    title: "Servidor offline",
    description: "El servidor no está disponible",
    variant: "destructive" as const,
  },
  
  BACKEND_ONLINE: {
    title: "Servidor online",
    description: "Listo para descargar",
  },
} as const

// ============================================================================
// Placeholders y Labels
// ============================================================================

export const FORM_LABELS = {
  URL_INPUT: {
    AUDIO: "URL de YouTube o Spotify",
    VIDEO: "URL de YouTube",
    PLACEHOLDER_AUDIO: "https://www.youtube.com/watch?v=... o https://open.spotify.com/track/...",
    PLACEHOLDER_VIDEO: "https://www.youtube.com/watch?v=...",
  },
  
  QUALITY: {
    LABEL: "Calidad de audio",
    DESCRIPTION: "Mayor calidad = mayor tamaño de archivo",
  },
  
  FORMAT: {
    LABEL: "Formato de video",
    DESCRIPTION: "WebM es más ligero, MP4 más compatible",
  },
} as const

// ============================================================================
// Información y Ayuda
// ============================================================================

export const INFO_MESSAGES = {
  // Características
  FEATURES: {
    AUDIO: [
      "Descarga MP3 de YouTube y Spotify",
      "Calidad hasta 320 kbps",
      "Soporte para playlists",
      "Sin límite de descargas",
    ],
    VIDEO: [
      "Descarga video de YouTube",
      "Múltiples formatos (WebM, MP4, MKV)",
      "Calidad original",
      "Videos individuales",
    ],
  },
  
  // Avisos
  WARNINGS: {
    PLAYLIST: "Las playlists pueden tardar varios minutos",
    QUALITY: "Calidad máxima depende del contenido original",
    PRIVATE: "No se pueden descargar videos privados",
    LIVE: "No se pueden descargar transmisiones en vivo",
    RATE_LIMIT: "Demasiadas descargas pueden causar restricciones temporales",
  },
  
  // Legal
  LEGAL: {
    DISCLAIMER: "Usa esta herramienta solo para contenido que tengas derecho a descargar",
    COPYRIGHT: "Respeta los derechos de autor",
    PERSONAL_USE: "Solo para uso personal",
  },
} as const

// ============================================================================
// Estados del Backend
// ============================================================================

export const BACKEND_STATUS_MESSAGES = {
  ONLINE: "Servidor en línea",
  OFFLINE: "Servidor fuera de línea",
  CHECKING: "Verificando servidor...",
  ERROR: "Error al conectar con el servidor",
} as const

// ============================================================================
// Información de Archivos
// ============================================================================

export const FILE_MESSAGES = {
  SIZE: (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  },
  
  COUNT: {
    SINGLE: "1 archivo",
    MULTIPLE: (count: number) => `${count} archivos`,
  },
  
  TYPES: {
    AUDIO: "Audio MP3",
    VIDEO: "Video",
    ZIP: "Archivo comprimido",
  },
} as const

// ============================================================================
// Botones y Acciones
// ============================================================================

export const BUTTON_LABELS = {
  // Primarios
  DOWNLOAD: "Descargar",
  DOWNLOADING: "Descargando...",
  DOWNLOAD_NOW: "Descargar ahora",
  
  // Secundarios
  CANCEL: "Cancelar",
  RETRY: "Reintentar",
  CLEAR: "Limpiar",
  RESET: "Nueva descarga",
  
  // Info
  GET_INFO: "Ver info",
  SHOW_MORE: "Ver más",
  SHOW_LESS: "Ver menos",
  
  // Archivos
  DOWNLOAD_FILE: "Descargar",
  DOWNLOAD_ZIP: "Descargar ZIP",
  DOWNLOAD_ALL: "Descargar todo",
} as const

// ============================================================================
// Utilidades
// ============================================================================

/**
 * Obtiene el mensaje apropiado según el estado
 */
export function getDownloadStatusMessage(
  status: string,
  type: "audio" | "video" = "audio"
): string {
  switch (status) {
    case "idle":
      return type === "audio" 
        ? DOWNLOAD_MESSAGES.IDLE.AUDIO 
        : DOWNLOAD_MESSAGES.IDLE.VIDEO
    
    case "queued":
      return DOWNLOAD_MESSAGES.PROCESSING.QUEUED
    
    case "running":
    case "downloading":
      return type === "audio"
        ? DOWNLOAD_MESSAGES.PROCESSING.DOWNLOADING
        : DOWNLOAD_MESSAGES.PROCESSING.DOWNLOADING
    
    case "converting":
      return DOWNLOAD_MESSAGES.PROCESSING.CONVERTING
    
    case "success":
    case "completed":
      return type === "audio"
        ? DOWNLOAD_MESSAGES.SUCCESS.AUDIO_SINGLE
        : DOWNLOAD_MESSAGES.SUCCESS.VIDEO_SINGLE
    
    case "failed":
      return DOWNLOAD_MESSAGES.ERRORS.DOWNLOAD_FAILED
    
    default:
      return DOWNLOAD_MESSAGES.PROCESSING.DOWNLOADING
  }
}

/**
 * Obtiene el mensaje de error apropiado
 */
export function getErrorMessage(error: any): string {
  if (typeof error === "string") {
    if (error.toLowerCase().includes("network")) return DOWNLOAD_MESSAGES.ERRORS.NETWORK
    if (error.toLowerCase().includes("not found")) return DOWNLOAD_MESSAGES.ERRORS.NOT_FOUND
    if (error.toLowerCase().includes("timeout")) return DOWNLOAD_MESSAGES.ERRORS.TIMEOUT
    if (error.toLowerCase().includes("rate")) return DOWNLOAD_MESSAGES.ERRORS.RATE_LIMIT
    return error
  }
  
  if (error?.message) return getErrorMessage(error.message)
  
  return DOWNLOAD_MESSAGES.ERRORS.GENERIC
}
