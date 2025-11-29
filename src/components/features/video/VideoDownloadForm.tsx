"use client"

import { useState, useEffect } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { VideoFormatSelector } from "./VideoFormatSelector"
import { VideoDownloadSuccess } from "./VideoDownloadSuccess"
import { DownloadError } from "@/src/components/features/audio/DownloadError"
import { DownloadProgress } from "@/src/components/features/audio/DownloadProgress"
import { useVideoDownload } from "@/src/hooks/use-video-download"
import { isYouTubeVideoUrl, sanitizeYouTubeUrl } from "@/src/lib/validators"
import { DEFAULT_VIDEO_FORMAT } from "@/src/constants/video"
import { useToast } from "@/src/hooks/use-toast"
import type { BackendStatus } from "@/src/types/api"

interface VideoDownloadFormProps {
  backendStatus: BackendStatus
}

export default function VideoDownloadForm({ backendStatus }: VideoDownloadFormProps) {
  const [url, setUrl] = useState("")
  const [format, setFormat] = useState(DEFAULT_VIDEO_FORMAT)
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
    
    await handleVideoDownload(finalUrl, format)
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="video-url" className="text-sm font-bold text-foreground uppercase tracking-wide">
            URL del Video
          </label>
          <Input
            id="video-url"
            type="url"
            placeholder="Ej: https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={isDownloading}
            className={`h-12 text-base bg-muted/50 border-2 transition-colors pl-4 ${
              urlError ? 'border-destructive focus:border-destructive' : 'border-muted focus:border-primary'
            }`}
          />
          {urlError && (
            <p className="text-sm text-destructive mt-1">{urlError}</p>
          )}
        </div>

        <VideoFormatSelector 
          value={format} 
          onChange={setFormat} 
          disabled={isDownloading} 
        />

        <Button
          type="submit"
          disabled={isDownloading || backendStatus !== "connected"}
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30"
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
            className="w-full h-10 text-sm font-medium border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
