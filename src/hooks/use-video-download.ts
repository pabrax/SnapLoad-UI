import { useState } from "react"
import { POLLING_INTERVAL } from "@/src/constants/audio"
import { downloadFile } from "@/src/lib/utils/download-helpers"
import type { VideoJobStatus, VideoFile } from "@/src/types/api"

interface UseVideoDownloadReturn {
  status: VideoJobStatus
  files: VideoFile[]
  jobId: string | null
  errorMsg: string | null
  handleVideoDownload: (url: string, format: string) => Promise<void>
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

  const handleVideoDownload = async (url: string, format: string): Promise<void> => {
    setErrorMsg(null)
    setFiles([])
    setJobId(null)

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

      // Poll status
      let finished = false
      let consecutiveErrors = 0
      const MAX_CONSECUTIVE_ERRORS = 3
      
      while (!finished) {
        await new Promise((r) => setTimeout(r, POLLING_INTERVAL))
        
        try {
          const sres = await fetch(`/api/status/${encodeURIComponent(jid)}`)
          if (!sres.ok) {
            consecutiveErrors++
            console.warn('Status fetch failed:', sres.status, `(${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS})`)
            
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
              throw new Error('No se puede conectar con el backend. Verifica que esté ejecutándose.')
            }
            continue
          }
          
          consecutiveErrors = 0 // Reset on success
          
          const sdata = await sres.json()
          const st = (sdata.status || sdata.meta?.status || "").toLowerCase()
          
          if (["success", "failed", "cancelled"].includes(st)) {
            finished = true
            if (st !== "success") {
              throw new Error(sdata.meta?.error || "Job finalizado con error")
            }
          }
        } catch (err) {
          consecutiveErrors++
          console.warn("poll error", err, `(${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS})`)
          
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            throw new Error('No se puede conectar con el backend. Verifica que esté ejecutándose.')
          }
        }
      }

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

  return {
    status,
    files,
    jobId,
    errorMsg,
    handleVideoDownload,
    resetVideoState,
  }
}
