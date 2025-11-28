"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { DownloadRequest } from "@/src/types/api"

export interface UseDownloadProgressResult {
  isLoading: boolean
  progress: number
  status: string
  message: string
  error: string | null
  downloadId: string | null
  producedFiles: Array<{ name: string; size_bytes?: number }>
  fileDownloaded: boolean
  startDownload: (url: string, quality?: string) => Promise<boolean>
  cancelDownload: () => void
  clearError: () => void
}

export function useDownloadProgress(): UseDownloadProgressResult {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("idle")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [downloadId, setDownloadId] = useState<string | null>(null)
  const [producedFiles, setProducedFiles] = useState<Array<{ name: string; size_bytes?: number }>>([])
  const [fileDownloaded, setFileDownloaded] = useState(false)
  
  const abortControllerRef = useRef<AbortController | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const cancelDownload = useCallback(() => {
    // Cancelar request si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Limpiar estado
    setIsLoading(false)
    setProgress(0)
    setStatus("cancelled")
    setMessage("Descarga cancelada")
    setDownloadId(null)
  }, [])

  const startDownload = useCallback(async (url: string, quality = "192"): Promise<boolean> => {
    try {
      setError(null)
      setIsLoading(true)
      setProgress(0)
      setStatus("starting")
      setMessage("Iniciando descarga...")

      // Crear AbortController para cancelación
      abortControllerRef.current = new AbortController()

      const downloadRequest: DownloadRequest = {
        url,
        quality,
      }

      // Iniciar descarga (backend encola job y devuelve job_id)
      const response = await fetch("/api/download-with-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(downloadRequest),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al iniciar la descarga")
      }

      const downloadResponse = await response.json()
      const jobId = downloadResponse.job_id || downloadResponse.download_id || null
      if (!jobId) throw new Error('No job_id returned from backend')
      setDownloadId(jobId)
      setMessage(downloadResponse.message || 'Descarga encolada')

      // Poll backend status periodically via server proxy (/api/status/{jobId})
      setStatus("queued")

      const pollInterval = 4000
      let stopped = false
      let consecutiveErrors = 0
      const MAX_CONSECUTIVE_ERRORS = 3

      const poll = async () => {
        try {
          const sres = await fetch(`/api/status/${encodeURIComponent(jobId)}`)
          if (!sres.ok) {
            consecutiveErrors++
            console.warn("Status fetch returned:", sres.status, `(${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS})`)
            
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
              stopped = true
              setIsLoading(false)
              setStatus("error")
              setError("No se puede conectar con el backend. Verifica que esté ejecutándose.")
              return
            }
          } else {
            consecutiveErrors = 0 // Reset counter on success
            const sdata = await sres.json()
            const st = (sdata.status || sdata.meta?.status || '').toLowerCase()
            setStatus(st || 'unknown')
            // Optionally set progress if backend provides it in meta
            if (sdata.meta && typeof sdata.meta === 'object') {
              const progressVal = (sdata.meta.progress && Number(sdata.meta.progress)) || undefined
              if (typeof progressVal === 'number') setProgress(progressVal)
            }

            // Terminal states from backend: success, failed, cancelled
            if (['success', 'failed', 'cancelled'].includes(st)) {
              stopped = true
              setIsLoading(false)

              if (st === 'success') {
                // Obtener lista de ficheros y guardarla
                try {
                  const fres = await fetch(`/api/files/${encodeURIComponent(jobId)}`)
                  if (fres.ok) {
                    const fdata = await fres.json()
                    const files = fdata.files || []
                    setProducedFiles(files.map((f: any) => ({ name: f.name, size_bytes: f.size_bytes })))
                    // Auto-descarga si es solo un archivo
                    if (files.length === 1) {
                      try {
                        const filename = files[0].name
                        const fileResp = await fetch(`/api/files/${encodeURIComponent(jobId)}/download/${encodeURIComponent(filename)}`)
                        if (fileResp.ok) {
                          const blob = await fileResp.blob()
                          const downloadUrl = window.URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = downloadUrl
                          a.download = filename
                          document.body.appendChild(a)
                          a.click()
                          window.URL.revokeObjectURL(downloadUrl)
                          document.body.removeChild(a)
                          setFileDownloaded(true)
                        }
                      } catch (e) {
                        console.error('auto-download failed', e)
                      }
                    }
                  }
                } catch (e) {
                  console.error('Error fetching produced files:', e)
                }
              } else {
                // failed or cancelled
                setError(sdata.meta?.error || 'Job finalizado con error')
                // intentar cargar meta para detalles si no se obtuvo
                try {
                  const mres = await fetch(`/api/status/${encodeURIComponent(jobId)}`)
                  if (mres.ok) {
                    const mdata = await mres.json()
                    if (mdata.meta?.error && !error) {
                      setError(mdata.meta.error)
                    }
                  }
                } catch (e) {
                  // ignore
                }
              }
            }
          }
        } catch (e) {
          consecutiveErrors++
          console.error('Polling error', e, `(${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS})`)
          
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            stopped = true
            setIsLoading(false)
            setStatus("error")
            setError("No se puede conectar con el backend. Verifica que esté ejecutándose.")
            return
          }
        }

        if (!stopped) {
          setTimeout(poll, pollInterval)
        }
      }

      // start polling
      setTimeout(poll, pollInterval)

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al descargar"
      setError(errorMessage)
      setIsLoading(false)
      setStatus("error")
      setMessage("Error en la descarga")
      return false
    }
  }, [])

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    isLoading,
    progress,
    status,
    message,
    error,
    downloadId,
    producedFiles,
    fileDownloaded,
    startDownload,
    cancelDownload,
    clearError
  }
}
