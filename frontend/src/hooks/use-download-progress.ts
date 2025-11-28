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

      const pollInterval = 2000
      let stopped = false

      const poll = async () => {
        try {
          const sres = await fetch(`/api/status/${encodeURIComponent(jobId)}`)
          if (!sres.ok) {
            // If 404 or other, keep polling a few times then bail
            console.warn("Status fetch returned:", sres.status)
          } else {
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
                // Get produced files and trigger download of first file (if any)
                try {
                  const fres = await fetch(`/api/files/${encodeURIComponent(jobId)}`)
                  if (fres.ok) {
                    const fdata = await fres.json()
                    const files = fdata.files || []
                    if (files.length > 0) {
                      const filename = files[0].name
                      // Stream download via proxy
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
                      } else {
                        console.error('Error downloading produced file:', fileResp.status)
                      }
                    }
                  }
                } catch (e) {
                  console.error('Error fetching produced files:', e)
                }
              } else {
                // failed or cancelled
                setError(sdata.meta?.error || 'Job finalizado con error')
              }
            }
          }
        } catch (e) {
          console.error('Polling error', e)
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
    startDownload,
    cancelDownload,
    clearError
  }
}
