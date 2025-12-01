import { POLLING_INTERVAL } from "@/src/constants/audio"
import type { FileListItem } from "@/src/types/api"

export interface PollingConfig {
  jobId: string
  interval?: number
  maxConsecutiveErrors?: number
  onSuccess: (files: FileListItem[]) => void | Promise<void>
  onError: (error: Error) => void
  onStatusUpdate?: (status: string) => void
  shouldStop: () => boolean
}

/**
 * Poll job status hasta que termine (success, failed, cancelled)
 * Maneja errores de conexión con reintentos automáticos
 */
export async function pollJobStatus(config: PollingConfig): Promise<void> {
  const {
    jobId,
    interval = POLLING_INTERVAL,
    maxConsecutiveErrors = 3,
    onSuccess,
    onError,
    onStatusUpdate,
    shouldStop,
  } = config

  let consecutiveErrors = 0

  const poll = async (): Promise<void> => {
    if (shouldStop()) {
      return
    }

    try {
      const response = await fetch(`/api/status/${encodeURIComponent(jobId)}`)
      
      if (!response.ok) {
        consecutiveErrors++
        console.warn(`Status fetch failed: ${response.status} (${consecutiveErrors}/${maxConsecutiveErrors})`)
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          throw new Error("No se puede conectar con el backend. Verifica que esté ejecutándose.")
        }
        
        if (!shouldStop()) {
          setTimeout(() => poll(), interval)
        }
        return
      }
      
      consecutiveErrors = 0
      
      const data = await response.json()
      const status = (data.status || data.meta?.status || "").toLowerCase()
      
      if (onStatusUpdate) {
        onStatusUpdate(status)
      }
      
      if (["success", "failed", "cancelled"].includes(status)) {
        if (status === "success") {
          const filesResponse = await fetch(`/api/files/${encodeURIComponent(jobId)}`)
          if (!filesResponse.ok) {
            throw new Error("Error al obtener lista de archivos")
          }
          
          const filesData = await filesResponse.json()
          const files = filesData.files || []
          
          await onSuccess(files)
        } else {
          const error = new Error(data.meta?.error || "Job finalizado con error")
          onError(error)
          return
        }
      } else {
        if (!shouldStop()) {
          setTimeout(() => poll(), interval)
        }
      }
    } catch (err: any) {
      consecutiveErrors++
      console.warn("Polling error:", err, `(${consecutiveErrors}/${maxConsecutiveErrors})`)
      
      if (consecutiveErrors >= maxConsecutiveErrors) {
        onError(err instanceof Error ? err : new Error(String(err)))
        return
      }
      
      if (!shouldStop() && consecutiveErrors < maxConsecutiveErrors) {
        setTimeout(() => poll(), interval)
      }
    }
  }

  setTimeout(() => poll(), interval)
}

export async function enqueueDownload(
  url: string,
  options: { quality?: string; format?: string }
): Promise<string> {
  const endpoint = options.format ? "/api/download-video" : "/api/download-with-progress"
  
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, ...options }),
  })
  
  if (!response.ok) {
    throw new Error("Error al encolar descarga")
  }
  
  const data = await response.json()
  const jobId = data.job_id || data.download_id
  
  if (!jobId) {
    throw new Error("No se recibió job_id del servidor")
  }
  
  return jobId
}
