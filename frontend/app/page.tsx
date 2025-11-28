"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Download, Music, Loader2, CheckCircle2, AlertCircle, Disc3, Waves, Settings, Info, Archive, Trash2, Github } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card } from "@/src/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Badge } from "@/src/components/ui/badge"
import { useDownload } from "@/src/hooks/use-download"
import { useDownloadProgress } from "@/src/hooks/use-download-progress"
import { ProgressBar } from "@/src/components/features/progress-bar"
import type { AudioInfoResponse } from "@/src/types/api"
import { isValidContentUrl } from "@/src/lib/validators"
import VideoDownloader from "@/src/components/features/video-downloader"

type DownloadStatus = "idle" | "loading" | "success" | "error" | "info-loading"

interface DownloadResult {
  fileName: string
  fileSize?: number
  metadata?: {
    title?: string
    artist?: string
    duration?: number
    quality?: string
    platform?: string
  }
}

const QUALITY_OPTIONS = [
  { value: "96", label: "96 kbps", description: "Baja calidad" },
  { value: "128", label: "128 kbps", description: "Calidad estándar" },
  { value: "192", label: "192 kbps", description: "Alta calidad" },
  { value: "320", label: "320 kbps", description: "Máxima calidad" },
]

export default function MusicDownloader() {
  const [tab, setTab] = useState<'audio' | 'video'>('audio')
  const [url, setUrl] = useState("")
  const [quality, setQuality] = useState("192")
  const [status, setStatus] = useState<DownloadStatus>("idle")
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null)
  const [audioInfo, setAudioInfo] = useState<AudioInfoResponse | null>(null)
  const [backendStatus, setBackendStatus] = useState<"unknown" | "connected" | "disconnected">("unknown")

  const { isLoading, error, downloadFile, getAudioInfo, clearError } = useDownload()
  const { 
    isLoading: isProgressLoading, 
    progress, 
    status: progressStatus, 
    message: progressMessage, 
    error: progressError, 
    startDownload: startProgressDownload, 
    cancelDownload,
    clearError: clearProgressError 
  } = useDownloadProgress()

  // Playlist features removed — no longer provided by frontend

  // Verificar estado del backend al cargar
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch("/api/health")
        const data = await response.json()
        setBackendStatus(response.ok ? "connected" : "disconnected")
      } catch {
        setBackendStatus("disconnected")
      }
    }

    checkBackendHealth()
  }, [])

  // Limpiar errores cuando cambia la URL
  useEffect(() => {
    if (error) {
      clearError()
    }
    if (progressError) {
      clearProgressError()
    }
    setAudioInfo(null)
  }, [url, clearError, error, progressError, clearProgressError])

  // Use shared validators that match backend heuristics
  const validateUrl = (url: string): boolean => {
    try {
      return isValidContentUrl(url)
    } catch {
      return false
    }
  }

  const isPlaylistUrl = (url: string): boolean => {
    // Detectar URLs de playlist/album
    return url.toLowerCase().includes('/playlist') || 
           url.toLowerCase().includes('/album') || 
           url.toLowerCase().includes('playlist?list=')
  }

  const handleGetInfo = async () => {
    if (!url.trim()) return

    if (!validateUrl(url)) {
      setStatus("error")
      return
    }

    setStatus("info-loading")
    
    // Detectar si es playlist y obtener información apropiada
    if (isPlaylistUrl(url)) {
      // Playlist info endpoint removed; we don't fetch a rich playlist preview here.
      // The download flow will enqueue a job and the frontend will poll status.
      setStatus("idle")
      return
    }

    const info = await getAudioInfo(url)
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

    if (!validateUrl(url)) {
      setStatus("error")
      return
    }

    setStatus("loading")
    setDownloadResult(null)

    // Detectar si es playlist y usar un flujo sencillo basado en job/status/files
    if (isPlaylistUrl(url)) {
      try {
        setStatus("loading")

        // Encolar el job (usar proxy)
        const resp = await fetch('/api/download-with-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, quality }),
        })
        if (!resp.ok) throw new Error('Error al encolar descarga')
        const data = await resp.json()
        const jobId = data.job_id || data.download_id
        if (!jobId) throw new Error('No job_id returned')

        // Poll for status until terminal state
        const pollInterval = 2000
        let finished = false
        while (!finished) {
          await new Promise((r) => setTimeout(r, pollInterval))
          try {
            const sres = await fetch(`/api/status/${encodeURIComponent(jobId)}`)
            if (!sres.ok) continue
            const sdata = await sres.json()
            const st = (sdata.status || sdata.meta?.status || '').toLowerCase()
            if (['success', 'failed', 'cancelled'].includes(st)) {
              finished = true
              if (st !== 'success') throw new Error(sdata.meta?.error || 'Job finalizado con error')
            }
          } catch (e) {
            console.warn('Polling error', e)
          }
        }

        // Obtener lista de ficheros y descargarlos secuencialmente
        const fres = await fetch(`/api/files/${encodeURIComponent(jobId)}`)
        if (!fres.ok) throw new Error('Error listando ficheros producidos')
        const fdata = await fres.json()
        const files = fdata.files || []
        for (const f of files) {
          try {
            const filename = f.name
            const fileResp = await fetch(`/api/files/${encodeURIComponent(jobId)}/download/${encodeURIComponent(filename)}`)
            if (!fileResp.ok) {
              console.error('Error downloading produced file:', fileResp.status)
              continue
            }
            const blob = await fileResp.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = downloadUrl
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(downloadUrl)
            document.body.removeChild(a)
          } catch (e) {
            console.error('Error downloading file', e)
          }
        }

        setStatus('success')
      } catch (err) {
        console.error('Playlist download error', err)
        setStatus('error')
      }
    } else {
      // Descarga individual — delegar al hook de progreso
      const success = await startProgressDownload(url, quality)
      if (success) {
        setStatus("success")
        // El resultado se maneja automáticamente en el hook de progreso
        setTimeout(() => {
          setStatus("idle")
          setUrl("")
          setDownloadResult(null)
          setAudioInfo(null)
        }, 3000)
      } else {
        setStatus("error")
      }
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-purple-950/20 to-teal-950/20" />

      <div className="absolute top-32 left-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl glow-effect" />
      <div
        className="absolute bottom-20 right-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl glow-effect"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-24 h-24 bg-teal-500/10 rounded-full blur-3xl glow-effect"
        style={{ animationDelay: "2s" }}
      />

  <div className="relative z-10 w-full max-w-4xl px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4 float-animation">
            <Disc3 className="w-10 h-10 text-blue-400" strokeWidth={2} />
            <Waves className="w-10 h-10 text-purple-400" strokeWidth={2} />
            <Music className="w-10 h-10 text-teal-400" strokeWidth={2} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent leading-tight">
            LocalSongs
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium mb-4">
            Descarga tu música favorita de YouTube y Spotify
          </p>
          
          {/* Backend Status */}
          <div className="flex justify-center">
            <Badge 
              variant={backendStatus === "connected" ? "default" : "destructive"}
              className="text-xs"
            >
              {backendStatus === "connected" ? "🟢 Conectado" : 
               backendStatus === "disconnected" ? "🔴 Backend desconectado" : 
               "🟡 Verificando..."}
            </Badge>
          </div>
        </div>

        {/* Tabs: Audio / Video */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setTab('audio')}
            className={`px-4 py-2 rounded-full font-semibold ${tab === 'audio' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-slate-800 text-muted-foreground'}`}>
            Audio
          </button>
          <button
            type="button"
            onClick={() => setTab('video')}
            className={`px-4 py-2 rounded-full font-semibold ${tab === 'video' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-slate-800 text-muted-foreground'}`}>
            Video
          </button>
        </div>

        <Card className="relative p-6 md:p-8 bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700/50 shadow-2xl shadow-slate-950/50">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-teal-500/10 blur-xl" />
          {tab === 'audio' ? (
            <div className="relative">
              <form onSubmit={handleDownload} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-bold text-foreground uppercase tracking-wide">
                  URL del Audio
                </label>
                <div className="relative">
                  <Input
                    id="url"
                    type="url"
                    placeholder="Ej: https://open.spotify.com/track/... o https://www.youtube.com/watch?v=..."
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

              {/* Audio Info Preview */}
              {audioInfo && audioInfo.success && audioInfo.metadata && (
                <div className="p-3 bg-muted/30 border border-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-xs uppercase tracking-wide">Vista Previa</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm">{audioInfo.metadata.title}</p>
                    {audioInfo.metadata.artist && (
                      <p className="text-muted-foreground text-sm">{audioInfo.metadata.artist}</p>
                    )}
                    <div className="flex gap-2">
                      {audioInfo.metadata.platform && (
                        <Badge variant="secondary" className="text-xs">{audioInfo.metadata.platform}</Badge>
                      )}
                      {audioInfo.metadata.duration && (
                        <Badge variant="outline" className="text-xs">
                          {Math.floor(audioInfo.metadata.duration / 60)}:{(audioInfo.metadata.duration % 60).toString().padStart(2, '0')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Calidad de Audio
                </label>
                <Select value={quality} onValueChange={setQuality} disabled={isLoading}>
                  <SelectTrigger className="h-12 text-base bg-muted/50 border-2 border-muted focus:border-primary">
                    <SelectValue placeholder="Selecciona la calidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-sm text-muted-foreground ml-2">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={isLoading || isProgressLoading || backendStatus !== "connected"}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30"
                size="lg"
              >
                {(isLoading || isProgressLoading) ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isProgressLoading ? progressMessage || "Procesando descarga..." : "Procesando descarga..."}
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Descargar Ahora
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

              {/* Progress Bar - Individual */}
              {isProgressLoading && (
                <div className="mt-4 p-4 bg-muted/20 border-2 border-muted rounded-lg backdrop-blur-sm">
                  <ProgressBar
                    value={progress}
                    status={progressStatus}
                    message={progressMessage}
                    showPercentage={true}
                    animated={true}
                    className="w-full"
                  />
                </div>
              )}

              {/* Success Message */}
              {status === "success" && downloadResult && (
                <div className="mt-4 p-4 bg-primary/20 border-2 border-primary rounded-lg backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary mb-1">¡Descarga exitosa!</p>
                      <p className="text-xs text-primary/80 mb-2">El archivo se ha descargado correctamente</p>
                      <div className="flex flex-wrap gap-1">
                        {downloadResult.metadata?.quality && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                            {downloadResult.metadata.quality} kbps
                          </Badge>
                        )}
                        {downloadResult.metadata?.platform && (
                          <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                            {downloadResult.metadata.platform}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {(status === "error" || error || progressError) && (
                <div className="mt-4 p-4 bg-destructive/20 border-2 border-destructive rounded-lg flex items-start gap-3 backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-destructive">Error</p>
                    <p className="text-xs text-destructive/80 mt-1">
                      {progressError || error || 
                       (!validateUrl(url) && url ? "URL no soportada. Usa: open.spotify.com/track/..., youtube.com/watch?v=..., o music.youtube.com/watch?v=..." : 
                        "No se pudo procesar la solicitud. Verifica la URL e intenta nuevamente.")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <VideoDownloader noCard />
            </div>
          )}
        </Card>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-full backdrop-blur-sm">
            <p className="text-xs font-bold text-primary">YouTube • Spotify</p>
          </div>
          <div className="px-3 py-1.5 bg-secondary/20 border border-secondary/40 rounded-full backdrop-blur-sm">
            <p className="text-xs font-bold text-secondary">MP3 Alta Calidad</p>
          </div>
          <div className="px-3 py-1.5 bg-accent/20 border border-accent/40 rounded-full backdrop-blur-sm">
            <p className="text-xs font-bold text-accent">100% Seguro</p>
          </div>
          <a 
            href="https://github.com/pabrax/LocalSongs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-slate-700/40 border border-slate-500/40 rounded-full backdrop-blur-sm hover:bg-slate-600/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-1.5">
              <Github className="w-3 h-3 text-slate-300 group-hover:text-white transition-colors" />
              <p className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                Github
              </p>
            </div>
          </a>
        </div>
      </div>
    </main>
  )
}
