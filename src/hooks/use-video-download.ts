import { useState, useRef } from "react"
import { useToast } from "@/src/hooks/use-toast"
import { pollJobStatus, enqueueDownload } from "@/src/lib/utils/polling-helpers"
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
    pollingStoppedRef.current = false

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
      
      // Check cache hit
      if (data.status === 'ready' && data.files && data.files.length > 0) {
        try {
          const fres = await fetch(`/api/files/${encodeURIComponent(jid)}`)
          if (fres.ok) {
            const fdata = await fres.json()
            const fileList = fdata.files.map((f: any) => ({ 
              name: f.name, 
              size: f.size_bytes 
            }))
            setFiles(fileList)
            setStatus("success")
            
            for (const f of fdata.files) {
              await downloadFile(jid, f.name)
            }
            
            return
          }
        } catch (e) {
          console.error("Error loading cached files:", e)
        }
        
        const fileList = data.files.map((f: any) => {
          if (typeof f === 'string') {
            const filename = f.split('/').pop() || f
            return { name: filename, size: undefined }
          }
          return { name: f.name || f.filename, size: f.size || f.size_bytes }
        })
        setFiles(fileList)
        setStatus("success")
        
        for (const f of fileList) {
          await downloadFile(jid, f.name)
        }
        
        return
      }
      
      setStatus("polling")

      await pollJobStatus({
        jobId: jid,
        shouldStop: () => pollingStoppedRef.current,
        onSuccess: async (files) => {
          setFiles(files.map(f => ({ name: f.name, size: f.size_bytes })))
          setStatus("success")

          for (const f of files) {
            await downloadFile(jid, f.name)
          }
        },
        onError: (error) => {
          setErrorMsg(error.message)
          setStatus("error")
        }
      })

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
    pollingStoppedRef.current = true

    if (jobId) {
      try {
        const response = await fetch(`/api/cancel/${encodeURIComponent(jobId)}`, {
          method: "POST",
        })
        
        if (response.ok) {
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
