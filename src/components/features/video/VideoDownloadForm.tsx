"use client"

import { useState, useEffect } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { heroInputClass, heroLabelClass, primaryActionClass, cancelActionClass } from "@/src/components/features/shared/hero-field"
import { Input } from "@/src/components/ui/input"
import { VideoFormatSelector } from "./VideoFormatSelector"
import { VideoResolutionSelector } from "./VideoResolutionSelector"
import { VideoDownloadSuccess } from "./VideoDownloadSuccess"
import { DownloadError } from "@/src/components/features/audio/DownloadError"
import { DownloadProgress } from "@/src/components/features/audio/DownloadProgress"
import { useVideoDownload } from "@/src/hooks/use-video-download"
import { isYouTubeVideoUrl, sanitizeYouTubeUrl } from "@/src/lib/validators"
import { DEFAULT_VIDEO_FORMAT, DEFAULT_VIDEO_RESOLUTION } from "@/src/constants/video"
import { clampResolution } from "@/src/lib/media-options"
import { useToast } from "@/src/hooks/use-toast"
import type { BackendStatus } from "@/src/types/api"

interface VideoDownloadFormProps {
  backendStatus: BackendStatus
}

export default function VideoDownloadForm({ backendStatus }: VideoDownloadFormProps) {
  const [url, setUrl] = useState("")
  const [format, setFormat] = useState<string>(DEFAULT_VIDEO_FORMAT)
  const [resolution, setResolution] = useState<string>(DEFAULT_VIDEO_RESOLUTION)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [componentStatus, setComponentStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const { toast } = useToast()

  const {
    status,
    files,
    jobId,
    errorMsg,
    handleVideoDownload,
    cancelVideoDownload,
    resetVideoState,
  } = useVideoDownload()

  // Sync hook status to component status
  useEffect(() => {
    if (status === 'success' && files.length > 0 && componentStatus !== 'success') {
      setComponentStatus('success')
    } else if (status === 'error' && componentStatus !== 'error') {
      setComponentStatus('error')
    }
  }, [status, files.length, componentStatus])

  const validateUrl = (u: string): boolean => {
    try {
      return isYouTubeVideoUrl(u)
    } catch {
      return false
    }
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    setUrlError(null)
    
    // Validate on blur/paste - check if it's a non-YouTube URL
    if (value.trim() && !validateUrl(value)) {
      if (value.includes('music.youtube.com')) {
        setUrlError('YouTube Music no está soportado en video. Usa la sección de Audio.')
      } else if (value.includes('spotify.com')) {
        setUrlError('Spotify no tiene videos. Usa la sección de Audio.')
      } else if (value.startsWith('http')) {
        setUrlError('Solo se permiten URLs de YouTube (youtube.com/youtu.be)')
      }
    }
  }

  const handleFormatChange = (value: string) => {
    setFormat(value)
    // mov/avi no admiten más de 1080p: baja la resolución elegida si ya no está disponible
    setResolution((current) => clampResolution(value, current))
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    
    if (!url.trim()) return
    
    // Sanitize YouTube URLs
    const { sanitized, wasModified, warning } = sanitizeYouTubeUrl(url)
    if (wasModified) {
      setUrl(sanitized)
      toast({
        title: "URL modificada",
        description: warning,
        variant: "default",
      })
    }
    const finalUrl = sanitized
    
    if (!validateUrl(finalUrl)) {
      toast({
        title: "URL no válida",
        description: "Solo se permiten URLs de YouTube (youtube.com/youtu.be). Para contenido de YouTube Music usa la sección de Audio.",
        variant: "destructive",
      })
      return
    }
    
    await handleVideoDownload(finalUrl, format, resolution)
  }

  const handleCleanup = () => {
    setComponentStatus('idle')
    resetVideoState()
    setUrl("")
    setUrlError(null)
  }

  const isDownloading = status === "loading" || status === "polling"

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="video-url" className={heroLabelClass}>
            URL del Video
          </label>
          <Input
            id="video-url"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(urlError)}
            aria-describedby={urlError ? "video-url-error" : undefined}
            placeholder="Ej: https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={isDownloading}
            className={`${heroInputClass} pr-4 ${urlError ? 'border-tomato shadow-[4px_4px_0_var(--tomato)]' : ''}`}
          />
          {urlError && (
            <p id="video-url-error" role="alert" className="text-sm text-tomato mt-1">{urlError}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <VideoFormatSelector
            value={format}
            onChange={handleFormatChange}
            disabled={isDownloading}
          />

          <VideoResolutionSelector
            value={resolution}
            format={format}
            onChange={setResolution}
            disabled={isDownloading}
          />
        </div>

        <Button
          type="submit"
          disabled={isDownloading || backendStatus !== "connected"}
          className={primaryActionClass}
          size="lg"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Descargar Video
            </>
          )}
        </Button>

        {/* Botón de cancelar durante descarga */}
        {isDownloading && (
          <Button
            type="button"
            variant="outline"
            onClick={cancelVideoDownload}
            className={cancelActionClass}
          >
            Cancelar Descarga
          </Button>
        )}
      </form>

      {/* Progress */}
      {isDownloading && (
        <DownloadProgress
          isPlaylistPolling={false}
          progressStatus={status === "polling" ? "running" : "queued"}
          pollingMessage={status === "polling" ? "Descargando video..." : "Iniciando descarga..."}
        />
      )}

      {/* Success */}
      {componentStatus === "success" && files.length > 0 && (
        <VideoDownloadSuccess 
          files={files} 
          jobId={jobId} 
          onClean={handleCleanup}
        />
      )}

      {/* Error */}
      {(componentStatus === "error" || errorMsg) && (
        <DownloadError
          error={errorMsg || "No se pudo completar la operación"}
          onClose={handleCleanup}
        />
      )}
    </div>
  )
}
