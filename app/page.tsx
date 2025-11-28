"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Download, Music, Loader2, CheckCircle2, AlertCircle, Disc3, Waves, Settings, Info, Github } from "lucide-react"
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
  const [overrideFiles, setOverrideFiles] = useState<Array<{ name: string; size_bytes?: number }>>([])
  const [overrideJobId, setOverrideJobId] = useState<string | null>(null)
  const [isPlaylistPolling, setIsPlaylistPolling] = useState(false)
  const [pollingTick, setPollingTick] = useState(0)
  const [resultQuality, setResultQuality] = useState<string | null>(null)

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
    clearError: clearProgressError 
  } = useDownloadProgress()

  // Tick to rotate informative messages during polling
  useEffect(() => {
    const polling = isPlaylistPolling || progressStatus === 'queued' || progressStatus === 'running'
    if (!polling) return
    const id = setInterval(() => setPollingTick((t) => t + 1), 3000)
    return () => clearInterval(id)
  }, [isPlaylistPolling, progressStatus])

  const pollingMessage = () => {
    const steps = [
      'Conectando con el servidor…',
      'Obteniendo información…',
      'Descargando…',
      'Codificando…',
      'Preparando archivos…',
    ]
    const idx = pollingTick % steps.length
    if (progressMessage) return progressMessage
    if (progressStatus === 'queued') return 'Descarga encolada'
    return steps[idx]
  }

  // Verificar estado del backend una sola vez al montar la app
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch("/api/health")
        setBackendStatus(response.ok ? "connected" : "disconnected")
      } catch {
        setBackendStatus("disconnected")
      }
    }
    checkBackendHealth()
  }, [])

  // Limpiar errores cuando cambia la URL
  useEffect(() => {
    if (error) clearError()
    if (progressError) clearProgressError()
    setAudioInfo(null)
  }, [url, clearError, error, progressError, clearProgressError])

  // Use shared validators that match backend heuristics
  const validateUrl = (u: string): boolean => {
    try {
      return isValidContentUrl(u)
    } catch {
      return false
    }
  }

  const isPlaylistUrl = (u: string): boolean => {
    const s = u.toLowerCase()
    return s.includes('/playlist') || s.includes('/album') || s.includes('playlist?list=')
  }

  const handleGetInfo = async () => {
    if (!url.trim()) return
    if (!validateUrl(url)) { setStatus("error"); return }
    setStatus("info-loading")
    if (isPlaylistUrl(url)) { setStatus("idle"); return }
    const info = await getAudioInfo(url)
    if (info && info.success) { setAudioInfo(info); setStatus("idle") } else { setStatus("error") }
  }

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) { setStatus("error"); return }
    if (!validateUrl(url)) { setStatus("error"); return }
    setStatus("loading")
    setDownloadResult(null)
    // limpiar cualquier resultado anterior SOLO cuando se confirma nueva descarga
    setOverrideFiles([])
    setOverrideJobId(null)
    // snapshot de la calidad seleccionada para mostrar en resultado
    setResultQuality(quality)

    // Detectar playlist: iniciar job y esperar terminal state, luego mostrar archivos
    if (isPlaylistUrl(url)) {
      try {
        setIsPlaylistPolling(true)
        const resp = await fetch('/api/download-with-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, quality }),
        })
        if (!resp.ok) throw new Error('Error al encolar descarga')
        const data = await resp.json()
        const jobId = data.job_id || data.download_id
        if (!jobId) throw new Error('No job_id returned')

        // Poll for status hasta estado terminal
        const pollInterval = 4000
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

        // Obtener lista de ficheros para UI (sin auto-descargar todos)
        const fres = await fetch(`/api/files/${encodeURIComponent(jobId)}`)
        if (!fres.ok) throw new Error('Error listando ficheros producidos')
        const fdata = await fres.json()
        const files = fdata.files || []
        setOverrideFiles(files.map((f: any) => ({ name: f.name, size_bytes: f.size_bytes })))
        setOverrideJobId(jobId)
        setStatus('success')
        setIsPlaylistPolling(false)
      } catch (err) {
        console.error('Playlist download error', err)
        setStatus('error')
        setIsPlaylistPolling(false)
      }
    } else {
      // Descarga individual — delegar al hook de progreso (auto-descarga al terminar)
      setOverrideFiles([])
      setOverrideJobId(null)
      const started = await startProgressDownload(url, quality)
      if (!started) { setStatus("error") } else { setStatus("loading") }
    }
  }

  // Sincronizar estado UI de éxito cuando hook reporta éxito
  useEffect(() => {
    if (progressStatus === 'success') {
      setStatus('success')
    }
  }, [progressStatus])

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
                disabled={
                  isLoading || backendStatus !== "connected" ||
                  progressStatus === 'queued' || progressStatus === 'running' || isProgressLoading || isPlaylistPolling
                }
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30"
                size="lg"
              >
                {(isLoading || isProgressLoading || isPlaylistPolling || progressStatus === 'queued' || progressStatus === 'running') ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {progressMessage || (isPlaylistPolling ? 'Procesando playlist...' : 'Procesando descarga...')}
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
              {(isProgressLoading || isPlaylistPolling || progressStatus === 'queued' || progressStatus === 'running') && (
                <div className="mt-4 p-4 bg-muted/20 border-2 border-muted rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-semibold">{isPlaylistPolling ? 'Procesando playlist' : (progressStatus === 'queued' ? 'En cola' : 'En progreso')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{pollingMessage()}</p>
                </div>
              )}

              {/* Éxito */}
              {status === "success" && (
                (overrideFiles.length || producedFiles.length) <= 1 ? (
                  // Canción individual: alerta breve y descarga automática del .mp3
                  <div className="mt-4 p-4 bg-primary/15 border-2 border-primary rounded-lg backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-primary mb-1">Canción descargada</p>
                        <p className="text-xs text-primary/80 mb-2">{fileDownloaded ? 'Tu archivo .mp3 se descargó automáticamente.' : 'Procesando la descarga del archivo...'}</p>
                        <div className="flex flex-wrap gap-1">
                          {(resultQuality ?? quality) && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">{(resultQuality ?? quality)} kbps</Badge>
                          )}
                          {audioInfo?.metadata?.platform && (
                            <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20 text-xs">{audioInfo.metadata.platform}</Badge>
                          )}
                        </div>
                        {/* Mostrar nombre + acciones también en single */}
                        <div className="mt-3 space-y-2">
                          <ul className="space-y-1">
                            {((overrideFiles.length ? overrideFiles : producedFiles)).slice(0,1).map(f => (
                              <li key={f.name} className="flex items-center justify-between text-xs bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                                <span className="truncate max-w-[70%]" title={f.name}>{f.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] opacity-70">{f.size_bytes ? `${Math.round(f.size_bytes/1024)} KB` : ''}</span>
                                  {(overrideJobId || downloadId) && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={async () => {
                                        const jid = overrideJobId || downloadId
                                        if (!jid) return
                                        try {
                                          const res = await fetch(`/api/files/${encodeURIComponent(String(jid))}/download/${encodeURIComponent(f.name)}`)
                                          if (!res.ok) throw new Error(`status ${res.status}`)
                                          const blob = await res.blob()
                                          const urlObj = window.URL.createObjectURL(blob)
                                          const a = document.createElement('a')
                                          a.href = urlObj
                                          a.download = f.name
                                          document.body.appendChild(a)
                                          a.click()
                                          window.URL.revokeObjectURL(urlObj)
                                          document.body.removeChild(a)
                                        } catch (e) {
                                          console.error('single download error', e)
                                        }
                                      }}
                                    >Descargar</Button>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                          {(overrideJobId || downloadId) && (
                            <div className="flex gap-2 pt-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  const jid = overrideJobId || downloadId
                                  if (!jid) return
                                  try {
                                    const res = await fetch(`/api/files/${encodeURIComponent(String(jid))}/archive`)
                                    if (!res.ok) throw new Error(`ZIP status ${res.status}`)
                                    const blob = await res.blob()
                                    const urlObj = window.URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = urlObj
                                    a.download = `${jid}.zip`
                                    document.body.appendChild(a)
                                    a.click()
                                    window.URL.revokeObjectURL(urlObj)
                                    document.body.removeChild(a)
                                  } catch (e) {
                                    console.error('zip error', e)
                                  }
                                }}
                              >Descargar ZIP</Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  const jid = overrideJobId || downloadId
                                  const files = ((overrideFiles.length ? overrideFiles : producedFiles)).slice(0,1)
                                  if (!jid || !files.length) return
                                  for (const f of files) {
                                    try {
                                      const res = await fetch(`/api/files/${encodeURIComponent(String(jid))}/download/${encodeURIComponent(f.name)}`)
                                      if (!res.ok) { console.error('error file', f.name, res.status); continue }
                                      const blob = await res.blob()
                                      const urlObj = window.URL.createObjectURL(blob)
                                      const a = document.createElement('a')
                                      a.href = urlObj
                                      a.download = f.name
                                      document.body.appendChild(a)
                                      a.click()
                                      window.URL.revokeObjectURL(urlObj)
                                      document.body.removeChild(a)
                                      await new Promise(r => setTimeout(r, 250))
                                    } catch (e) {
                                      console.error('download all single error', f.name, e)
                                    }
                                  }
                                }}
                              >Descargar todo</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Playlist/varios archivos: mostrar lista y opción ZIP
                  <div className="mt-4 p-4 bg-primary/15 border-2 border-primary rounded-lg backdrop-blur-sm space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-primary mb-1">¡Descarga exitosa!</p>
                        <p className="text-xs text-primary/80 mb-2">Se produjeron varios archivos. Descarga el ZIP o archivos individuales.</p>
                        <div className="flex flex-wrap gap-1">
                          {(resultQuality ?? quality) && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">{(resultQuality ?? quality)} kbps</Badge>
                          )}
                          {audioInfo?.metadata?.platform && (
                            <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20 text-xs">{audioInfo.metadata.platform}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-primary/80 uppercase tracking-wide">Archivos</p>
                      <ul className="space-y-1">
                        {(overrideFiles.length ? overrideFiles : producedFiles).map(f => (
                          <li key={f.name} className="flex items-center justify-between text-xs bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                            <span className="truncate max-w-[60%]" title={f.name}>{f.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] opacity-70">{f.size_bytes ? `${Math.round(f.size_bytes/1024)} KB` : ""}</span>
                              {(overrideJobId || downloadId) && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={async () => {
                                    const jid = overrideJobId || downloadId
                                    if (!jid) return
                                    try {
                                      const res = await fetch(`/api/files/${encodeURIComponent(jid)}/download/${encodeURIComponent(f.name)}`)
                                      if (!res.ok) throw new Error(`status ${res.status}`)
                                      const blob = await res.blob()
                                      const urlObj = window.URL.createObjectURL(blob)
                                      const a = document.createElement('a')
                                      a.href = urlObj
                                      a.download = f.name
                                      document.body.appendChild(a)
                                      a.click()
                                      window.URL.revokeObjectURL(urlObj)
                                      document.body.removeChild(a)
                                    } catch (e) {
                                      console.error('single playlist file download error', e)
                                    }
                                  }}
                                >Descargar</Button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                      {(overrideJobId || downloadId) && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const jid = overrideJobId || downloadId
                              try {
                                const res = await fetch(`/api/files/${encodeURIComponent(String(jid))}/archive`)
                                if (!res.ok) throw new Error(`ZIP status ${res.status}`)
                                const blob = await res.blob()
                                const urlObj = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = urlObj
                                a.download = `${jid}.zip`
                                document.body.appendChild(a)
                                a.click()
                                window.URL.revokeObjectURL(urlObj)
                                document.body.removeChild(a)
                              } catch (e) {
                                console.error('zip error', e)
                              }
                            }}
                          >Descargar ZIP</Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const jid = overrideJobId || downloadId
                              const files = (overrideFiles.length ? overrideFiles : producedFiles)
                              if (!jid || !files.length) return
                              for (const f of files) {
                                try {
                                  const res = await fetch(`/api/files/${encodeURIComponent(jid)}/download/${encodeURIComponent(f.name)}`)
                                  if (!res.ok) { console.error('error file', f.name, res.status); continue }
                                  const blob = await res.blob()
                                  const urlObj = window.URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = urlObj
                                  a.download = f.name
                                  document.body.appendChild(a)
                                  a.click()
                                  window.URL.revokeObjectURL(urlObj)
                                  document.body.removeChild(a)
                                  await new Promise(r => setTimeout(r, 250))
                                } catch (e) {
                                  console.error('download all error', f.name, e)
                                }
                              }
                            }}
                          >Descargar todo</Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setStatus('idle')
                              setUrl('')
                              setAudioInfo(null)
                              setOverrideFiles([])
                              setOverrideJobId(null)
                              setResultQuality(null)
                              clearError()
                              clearProgressError()
                            }}
                          >Limpiar</Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* Banner de error detallado */}
              {(status === "error" || progressStatus === 'failed' || error || progressError) && (
                <div className="mt-4 p-4 bg-destructive/15 border-2 border-destructive rounded-lg flex items-start gap-3 backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-destructive">Error</p>
                    <p className="text-xs text-destructive/80 mt-1 whitespace-pre-line">
                      {progressError || error || (!validateUrl(url) && url ? "URL no soportada. Usa enlaces válidos de Spotify o YouTube." : "Fallo en el job o descarga.")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      clearError()
                      clearProgressError()
                      setStatus('idle')
                    }}
                  >Cerrar</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <VideoDownloader noCard backendStatus={backendStatus} />
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
