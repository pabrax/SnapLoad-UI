"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Download, Loader2, Info } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { useDownload } from "@/src/hooks/use-download"
import { useDownloadProgress } from "@/src/hooks/use-download-progress"
import { useAudioDownload } from "@/src/hooks/use-audio-download"
import { usePlaylistPolling } from "@/src/hooks/use-playlist-polling"
import { AudioInfoPreview } from "./AudioInfoPreview"
import { QualitySelector } from "./QualitySelector"
import { DownloadProgress } from "./DownloadProgress"
import { DownloadSuccess } from "./DownloadSuccess"
import { DownloadError } from "./DownloadError"
import { isPlaylistUrl } from "@/src/lib/utils/download-helpers"
import { isValidContentUrl, sanitizeYouTubeUrl } from "@/src/lib/validators"
import { DEFAULT_QUALITY } from "@/src/constants/audio"
import { FORM_LABELS, BUTTON_LABELS, DOWNLOAD_MESSAGES, TOAST_MESSAGES } from "@/src/constants/messages"
import { useToast } from "@/src/hooks/use-toast"
import type { AudioInfoResponse, DownloadStatus, BackendStatus } from "@/src/types/api"

interface AudioDownloadFormProps {
  backendStatus: BackendStatus
}

export default function AudioDownloadForm({ backendStatus }: AudioDownloadFormProps) {
  const [url, setUrl] = useState("")
  const [quality, setQuality] = useState(DEFAULT_QUALITY)
  const [status, setStatus] = useState<DownloadStatus>("idle")
  const [audioInfo, setAudioInfo] = useState<AudioInfoResponse | null>(null)
  const [resultQuality, setResultQuality] = useState<string | null>(null)
  const { toast } = useToast()

  const { isLoading, error, getAudioInfo, clearError } = useDownload()
  const { 
    isLoading: isProgressLoading, 
    progress, 
    status: progressStatus, 
    message: progressMessage, 
    error: progressError, 
    producedFiles,
    downloadId,
    fileDownloaded,
    startDownload: startProgressDownload, 
    cancelDownload,
    resetProgressState,
    clearError: clearProgressError 
  } = useDownloadProgress()

  const {
    isPlaylistPolling,
    overrideFiles,
    overrideJobId,
    handlePlaylistDownload,
    resetPlaylistState,
  } = useAudioDownload()

  const { pollingMessage } = usePlaylistPolling({
    isActive: isPlaylistPolling,
    progressStatus,
    progressMessage,
  })

  // Limpiar errores cuando cambia la URL
  useEffect(() => {
    if (error) clearError()
    if (progressError) clearProgressError()
    setAudioInfo(null)
  }, [url, clearError, error, progressError, clearProgressError])

  // Sincronizar estado UI de éxito cuando hook reporta éxito o ready
  // Una vez en success, mantener ese estado (no volver atrás)
  useEffect(() => {
    if ((progressStatus === 'success' || progressStatus === 'ready') && status !== 'success') {
      console.log('[AUDIO-FORM] Setting status to success from progressStatus:', progressStatus)
      setStatus('success')
    }
  }, [progressStatus, status])

  const validateUrl = (u: string): boolean => {
    try {
      return isValidContentUrl(u)
    } catch {
      return false
    }
  }

  const handleGetInfo = async () => {
    if (!url.trim()) return
    
    // Sanitize YouTube URLs
    const { sanitized, wasModified, warning } = sanitizeYouTubeUrl(url)
    if (wasModified) {
      setUrl(sanitized)
      toast({
        title: TOAST_MESSAGES.URL_SANITIZED.title,
        description: warning || TOAST_MESSAGES.URL_SANITIZED.description,
        variant: "default",
      })
    }
    const finalUrl = sanitized
    
    if (!validateUrl(finalUrl)) { 
      setStatus("error")
      return 
    }
    
    setStatus("info-loading")
    
    if (isPlaylistUrl(finalUrl)) { 
      setStatus("idle")
      return 
    }
    
    const info = await getAudioInfo(finalUrl)
    if (info && info.success) { 
      setAudioInfo(info)
      setStatus("idle") 
    } else { 
      setStatus("error") 
    }
  }

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) { 
      setStatus("error")
      return 
    }
    
    // Sanitize YouTube URLs
    const { sanitized, wasModified, warning } = sanitizeYouTubeUrl(url)
    if (wasModified) {
      setUrl(sanitized)
      toast({
        title: TOAST_MESSAGES.URL_SANITIZED.title,
        description: warning || TOAST_MESSAGES.URL_SANITIZED.description,
        variant: "default",
      })
    }
    const finalUrl = sanitized
    
    if (!validateUrl(finalUrl)) { 
      setStatus("error")
      return 
    }
    
    setStatus("loading")
    
    // limpiar cualquier resultado anterior SOLO cuando se confirma nueva descarga
    resetPlaylistState()
    
    // snapshot de la calidad seleccionada para mostrar en resultado
    setResultQuality(quality)

    // Detectar playlist
    if (isPlaylistUrl(finalUrl)) {
      try {
        await handlePlaylistDownload(finalUrl, quality)
        setStatus('success')
      } catch (err) {
        console.error('Playlist download error', err)
        setStatus('error')
      }
    } else {
      // Descarga individual
      const started = await startProgressDownload(finalUrl, quality)
      if (!started) { 
        setStatus("error") 
      } else { 
        setStatus("loading") 
      }
    }
  }

  const handleCleanup = () => {
    // Reset all state to initial values
    setStatus('idle')
    setUrl('')
    setAudioInfo(null)
    setResultQuality(null)
    
    // Reset hooks
    resetPlaylistState()
    resetProgressState()
    
    // Clear errors
    clearError()
    clearProgressError()
  }

  const getErrorMessage = (): string | null => {
    if (progressError) return progressError
    if (error) return error
    if (!validateUrl(url) && url) {
      return "URL no soportada. Usa enlaces válidos de Spotify o YouTube."
    }
    // Solo mostrar error si realmente falló, no si está en success/ready
    if (status === "error" && progressStatus !== 'success' && progressStatus !== 'ready') {
      return "Fallo en el job o descarga."
    }
    return null
  }

  const isDownloading = isLoading || 
                        isProgressLoading || 
                        isPlaylistPolling || 
                        progressStatus === 'queued' || 
                        progressStatus === 'running'

  const showProgress = isProgressLoading || 
                       isPlaylistPolling || 
                       progressStatus === 'queued' || 
                       progressStatus === 'running'

  const hasError = status === "error" || 
                   progressStatus === 'failed' || 
                   error || 
                   progressError

  const files = overrideFiles.length > 0 ? overrideFiles : producedFiles
  const jobId = overrideJobId || downloadId

  return (
    <div className="relative">
      <form onSubmit={handleDownload} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-bold text-foreground uppercase tracking-wide">
            {FORM_LABELS.URL_INPUT.AUDIO}
          </label>
          <div className="relative">
            <Input
              id="url"
              type="url"
              placeholder={FORM_LABELS.URL_INPUT.PLACEHOLDER_AUDIO}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading || status === "info-loading"}
              className="h-12 text-base bg-muted/50 border-2 border-muted focus:border-primary transition-colors pl-4 pr-16"
            />
            {url && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGetInfo}
                disabled={status === "info-loading" || isLoading}
                className="absolute right-2 top-2 h-8 px-3"
              >
                {status === "info-loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        <AudioInfoPreview audioInfo={audioInfo} />

        <QualitySelector 
          value={quality} 
          onChange={setQuality} 
          disabled={isLoading} 
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
              {progressMessage || (isPlaylistPolling 
                ? DOWNLOAD_MESSAGES.PROCESSING.PLAYLIST_PROCESSING 
                : DOWNLOAD_MESSAGES.PROCESSING.DOWNLOADING)}
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              {BUTTON_LABELS.DOWNLOAD_NOW}
            </>
          )}
        </Button>
        
        {/* Botón de cancelar durante descarga */}
        {isProgressLoading && (
          <Button
            type="button"
            variant="outline"
            onClick={cancelDownload}
            className="w-full h-10 text-sm font-medium border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Cancelar Descarga
          </Button>
        )}
      </form>

      {/* Progress Bar */}
      {showProgress && (
        <DownloadProgress
          isPlaylistPolling={isPlaylistPolling}
          progressStatus={progressStatus}
          pollingMessage={pollingMessage}
        />
      )}

      {/* Success */}
      {status === "success" && files.length > 0 && (
        <DownloadSuccess
          files={files}
          jobId={jobId}
          quality={resultQuality ?? quality}
          audioInfo={audioInfo}
          fileDownloaded={fileDownloaded}
          onClean={handleCleanup}
        />
      )}

      {/* Error */}
      {hasError && (
        <DownloadError
          error={getErrorMessage()}
          onClose={handleCleanup}
        />
      )}
    </div>
  )
}
