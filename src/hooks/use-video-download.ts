import { useState, useRef } from "react"
import { useToast } from "@/src/hooks/use-toast"
import { POLLING_INTERVAL } from "@/src/constants/audio"
import { downloadFile } from "@/src/lib/utils/download-helpers"
import type { VideoJobStatus, VideoFile } from "@/src/types/api"

interface UseVideoDownloadReturn {
  status: VideoJobStatus
  files: VideoFile[]
  jobId: string | null
  errorMsg: string | null
  handleVideoDownload: (url: string, format: string) => Promise<void>
  cancelVideoDownload: () => Promise<void>
  resetVideoState: () => void
}

/**
 * Hook para manejar la lógica de descarga de video
 */
export function useVideoDownload(): UseVideoDownloadReturn {
  const [status, setStatus] = useState<VideoJobStatus>("idle")
  const [files, setFiles] = useState<VideoFile[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  
  const pollingStoppedRef = useRef(false)
  const { toast } = useToast()

  const handleVideoDownload = async (url: string, format: string): Promise<void> => {
    setErrorMsg(null)
    setFiles([])
    setJobId(null)
    pollingStoppedRef.current = false // Reset polling flag

    if (!url.trim()) {
      setErrorMsg("Introduce una URL")
      setStatus("error")
      return
    }

    setStatus("loading")

    try {
      const resp = await fetch("/api/download-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format }),
      })
      
      if (!resp.ok) throw new Error("Error encolar job")
      
      const data = await resp.json()
      const jid = data.job_id || data.download_id
      if (!jid) throw new Error("No job id returned")
      
      setJobId(jid)
      setStatus("polling")

      // Poll status usando recursión en lugar de while loop
      let consecutiveErrors = 0
      const MAX_CONSECUTIVE_ERRORS = 3
      
      const poll = async (): Promise<void> => {
        // Check if polling should stop
        if (pollingStoppedRef.current) {
          console.log("Video polling detenido por cancelación")
          return
        }

        try {
          const sres = await fetch(`/api/status/${encodeURIComponent(jid)}`)
          if (!sres.ok) {
            consecutiveErrors++
            console.warn('Status fetch failed:', sres.status, `(${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS})`)
            
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
              throw new Error('No se puede conectar con el backend. Verifica que esté ejecutándose.')
            }
            
            // Retry
            if (!pollingStoppedRef.current) {
              setTimeout(() => poll(), POLLING_INTERVAL)
            }
            return
          }
          
          consecutiveErrors = 0 // Reset on success
          
          const sdata = await sres.json()
          const st = (sdata.status || sdata.meta?.status || "").toLowerCase()
          
          if (["success", "failed", "cancelled"].includes(st)) {
            if (st === "success") {
              // Get files
              const fres = await fetch(`/api/files/${encodeURIComponent(jid)}`)
              if (!fres.ok) throw new Error("Error listando ficheros")
              
              const fdata = await fres.json()
              const list = fdata.files || []
              
              setFiles(list.map((f: any) => ({ name: f.name, size: f.size })))
              setStatus("success")

              // Auto-download sequentially
              for (const f of list) {
                await downloadFile(jid, f.name)
              }
            } else {
              throw new Error(sdata.meta?.error || "Job finalizado con error")
            }
          } else {
            // Continue polling
            if (!pollingStoppedRef.current) {
              setTimeout(() => poll(), POLLING_INTERVAL)
            }
          }
        } catch (err: any) {
          consecutiveErrors++
          console.warn("poll error", err, `(${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS})`)
          
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            throw new Error('No se puede conectar con el backend. Verifica que esté ejecutándose.')
          }
          
          // Retry if not max errors
          if (!pollingStoppedRef.current && consecutiveErrors < MAX_CONSECUTIVE_ERRORS) {
            setTimeout(() => poll(), POLLING_INTERVAL)
          }
        }
      }

      // Start polling
      setTimeout(() => poll(), POLLING_INTERVAL)

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err?.message || String(err))
      setStatus("error")
    }
  }

  const resetVideoState = () => {
    setStatus("idle")
    setFiles([])
    setErrorMsg(null)
    setJobId(null)
  }

  const cancelVideoDownload = async () => {
    // Detener polling inmediatamente
    pollingStoppedRef.current = true

    // Si hay un jobId, cancelar en el backend
    if (jobId) {
      try {
        const response = await fetch(`/api/cancel/${encodeURIComponent(jobId)}`, {
          method: "POST",
        })
        
        if (response.ok) {
          console.log("Video job cancelado en el backend:", jobId)
          toast({
            title: "Descarga de video cancelada",
            description: "La descarga de video ha sido cancelada exitosamente.",
          })
        } else {
          console.warn("No se pudo cancelar video en el backend:", await response.text())
          toast({
            title: "Descarga de video detenida",
            description: "Se detuvo el proceso localmente.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error al cancelar video en el backend:", error)
        toast({
          title: "Descarga de video detenida",
          description: "Se detuvo el proceso localmente.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Descarga de video cancelada",
        description: "La descarga ha sido detenida.",
      })
    }

    // Limpiar estado
    setStatus("idle")
    setFiles([])
    setErrorMsg(null)
    setJobId(null)
  }

  return {
    status,
    files,
    jobId,
    errorMsg,
    handleVideoDownload,
    cancelVideoDownload,
    resetVideoState,
  }
}
