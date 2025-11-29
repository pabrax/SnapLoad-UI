# Backend Synchronization

Este módulo mantiene la sincronización entre el frontend (Next.js/TypeScript) y el backend (FastAPI/Python).

## Archivos Sincronizados

### `/src/config/backend.ts`
Sincronizado con:
- `app/core/config.py` → Settings class
- `app/core/enums.py` → Job status, media types, download sources

**Contenido:**
- Extensiones de archivos (AUDIO_EXTENSIONS, VIDEO_EXTENSIONS)
- Formatos válidos (VALID_VIDEO_FORMATS)
- Estados de jobs (JOB_STATUS)
- Tipos de media (MEDIA_TYPE)
- Fuentes de descarga (DOWNLOAD_SOURCE)
- Estados de cache (CACHE_STATUS)
- Configuración general (CONFIG)

### `/src/lib/validators.ts`
Sincronizado con: `app/validators.py`

**Funciones:**
- `isSpotifyUrl()` → `URLValidator.is_spotify_url()`
- `isYouTubeUrl()` → `URLValidator.is_youtube_url()`
- `validateUrl()` → `URLValidator.validate_url()`
- `isValidBitrate()` → `QualityValidator.is_valid_bitrate()`
- `validateQuality()` → `QualityValidator.validate_quality()`
- `isValidVideoFormat()` → `FormatValidator.is_valid_video_format()`
- `validateVideoFormat()` → `FormatValidator.validate_format()`

### `/src/lib/backend-utils.ts`
Utilidades de UI para mapear datos del backend:

**Mapeos:**
- `JOB_STATUS_LABELS` → Etiquetas en español para estados
- `JOB_STATUS_COLORS` → Colores Tailwind para estados
- `JOB_STATUS_BADGE_VARIANTS` → Variantes de badges
- `MEDIA_TYPE_LABELS` → Etiquetas para tipos de media
- `DOWNLOAD_SOURCE_LABELS` → Etiquetas para fuentes

**Funciones de ayuda:**
- `isTerminalStatus()` → Verifica si el job terminó
- `isSuccessStatus()` → Verifica si fue exitoso
- `isActiveStatus()` → Verifica si está activo
- `formatFileSize()` → Formatea bytes a KB/MB/GB
- `formatBitrate()` → Formatea calidad de audio
- `getFileIcon()` → Emoji según tipo de archivo

## Uso

```typescript
import {
  VALID_VIDEO_FORMATS,
  JOB_STATUS,
  isTerminalStatus,
  validateVideoFormat,
  formatFileSize
} from "@/src/config"

// Validar formato
const result = validateVideoFormat("mp4")
if (!result.valid) {
  console.error(result.error)
}

// Verificar estado del job
if (isTerminalStatus(JOB_STATUS.SUCCESS)) {
  console.log("Job terminado")
}

// Formatear tamaño
console.log(formatFileSize(8147000)) // "7.77 MB"
```

## Actualización

Cuando cambies el backend:

1. Actualiza `app/core/config.py` o `app/core/enums.py`
2. Refleja los cambios en `src/config/backend.ts`
3. Actualiza validadores en `src/lib/validators.ts` si es necesario
4. Actualiza mapeos en `src/lib/backend-utils.ts` si agregaste nuevos estados

## Formatos Soportados

### Video
- webm, mp4, mkv, mov, avi

### Audio
- mp3, m4a, flac, wav, aac, ogg

### Calidad de Audio
- Valores numéricos: 96, 128, 192, 320 (con o sin 'k')
- Valores especiales: "0" (mejor), "bestaudio"

## Manejo de Errores

### `/src/types/errors.ts`
Sincronizado con: `app/core/exceptions.py`

**Clases de Error:**
- `InvalidURLError` → `InvalidURLException`
- `InvalidQualityError` → `InvalidQualityException`
- `InvalidFormatError` → `InvalidFormatException`
- `JobNotFoundError` → `JobNotFoundException`
- `FileNotFoundError` → `FileNotFoundException`
- `DownloadFailedError` → `DownloadFailedException`
- `ProcessExecutionError` → `ProcessExecutionException`

**Funciones:**
- `parseBackendError()` - Parsea errores del backend a clases tipadas
- `getUserFriendlyMessage()` - Convierte errores técnicos a mensajes amigables
- `isRetryableError()` - Determina si el error permite reintentar
- `getErrorSeverity()` - Obtiene el nivel de severidad (info, warning, error)

### `/src/hooks/use-error-handler.ts`
Hook para manejo centralizado de errores con notificaciones toast.

**Uso:**

```typescript
import { useErrorHandler } from "@/src/hooks/use-error-handler"

function MyComponent() {
  const { handleError, handleFetchError, withErrorHandling } = useErrorHandler()

  // Opción 1: Manejo manual
  const download = async () => {
    try {
      const response = await fetch("/api/download", { ... })
      if (!response.ok) {
        await handleFetchError(response, { 
          context: "Download",
          onRetry: () => download() 
        })
        return
      }
      // ...
    } catch (error) {
      handleError(error, { context: "Download" })
    }
  }

  // Opción 2: Wrapper automático
  const downloadWithRetry = withErrorHandling(
    async (url: string) => {
      const response = await fetch("/api/download", { ... })
      if (!response.ok) throw response
      return await response.json()
    },
    { 
      context: "Download",
      onRetry: () => downloadWithRetry(url)
    }
  )

  return <button onClick={() => downloadWithRetry(url)}>Download</button>
}
```

**Características:**
- ✅ Parseo automático de errores del backend
- ✅ Notificaciones toast con severidad apropiada
- ✅ Mensajes amigables para el usuario
- ✅ Botón de reintentar para errores recuperables
- ✅ Logging con contexto para debugging