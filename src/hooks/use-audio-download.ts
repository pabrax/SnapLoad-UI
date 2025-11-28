import { useState, useRef } from "react"
import { useToast } from "@/src/hooks/use-toast"
import { POLLING_INTERVAL } from "@/src/constants/audio"
import { isPlaylistUrl } from "@/src/lib/utils/download-helpers"
import type { ProducedFile } from "@/src/types/api"

interface UseAudioDownloadReturn {
  isPlaylistPolling: boolean
  overrideFiles: ProducedFile[]
  overrideJobId: string | null
  handlePlaylistDownload: (url: string, quality: string) => Promise<boolean>
  cancelPlaylistDownload: () => Promise<void>
  resetPlaylistState: () => void
}

/**
 * Hook para manejar la lógica de descarga de audio (playlists y singles)
 */
export function useAudioDownload(): UseAudioDownloadReturn {
  const [isPlaylistPolling, setIsPlaylistPolling] = useState(false)
  const [overrideFiles, setOverrideFiles] = useState<ProducedFile[]>([])
  const [overrideJobId, setOverrideJobId] = useState<string | null>(null)
  
  const pollingStoppedRef = useRef(false)
  const currentJobIdRef = useRef<string | null>(null)
  const { toast } = useToast()

  const handlePlaylistDownload = async (url: string, quality: string): Promise<boolean> => {
    if (!isPlaylistUrl(url)) {
      return false
    }

    try {
      setIsPlaylistPolling(true)
      pollingStoppedRef.current = false
      
      const resp = await fetch('/api/download-with-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, quality }),
      })
      
      if (!resp.ok) throw new Error('Error al encolar descarga')
      
      const data = await resp.json()
      const jobId = data.job_id || data.download_id
      if (!jobId) throw new Error('No job_id returned')
      
      currentJobIdRef.current = jobId

      // Poll usando recursión en lugar de while
      const poll = async (): Promise<void> => {
        if (pollingStoppedRef.current) {
          console.log('Playlist polling detenido por cancelación')
          return
        }
        
        try {
          const sres = await fetch(`/api/status/${encodeURIComponent(jobId)}`)
          if (!sres.ok) {
            if (!pollingStoppedRef.current) {
              setTimeout(() => poll(), POLLING_INTERVAL)
            }
            return
          }
          
          const sdata = await sres.json()
          const st = (sdata.status || sdata.meta?.status || '').toLowerCase()
          
          if (['success', 'failed', 'cancelled'].includes(st)) {
            if (st === 'success') {
              // Obtener lista de ficheros para UI
              const fres = await fetch(`/api/files/${encodeURIComponent(jobId)}`)
              if (!fres.ok) throw new Error('Error listando ficheros producidos')
              
              const fdata = await fres.json()
              const files = fdata.files || []
              
              setOverrideFiles(files.map((f: any) => ({ 
                name: f.name, 
                size_bytes: f.size_bytes 
              })))
              setOverrideJobId(jobId)
              setIsPlaylistPolling(false)
            } else {
              throw new Error(sdata.meta?.error || 'Job finalizado con error')
            }
          } else {
            // Continue polling
            if (!pollingStoppedRef.current) {
              setTimeout(() => poll(), POLLING_INTERVAL)
            }
          }
        } catch (e) {
          console.warn('Polling error', e)
          if (!pollingStoppedRef.current) {
            setTimeout(() => poll(), POLLING_INTERVAL)
          }
        }
      }

      // Start polling
      setTimeout(() => poll(), POLLING_INTERVAL)
      
      return true
    } catch (err) {
      console.error('Playlist download error', err)
      setIsPlaylistPolling(false)
      throw err
    }
  }

  const cancelPlaylistDownload = async () => {
    pollingStoppedRef.current = true

    if (currentJobIdRef.current) {
      try {
        const response = await fetch(`/api/cancel/${encodeURIComponent(currentJobIdRef.current)}`, {
          method: "POST",
        })
        
        if (response.ok) {
          console.log("Playlist job cancelado en el backend:", currentJobIdRef.current)
          toast({
            title: "Descarga de playlist cancelada",
            description: "La descarga de la playlist ha sido cancelada exitosamente.",
          })
        } else {
          console.warn("No se pudo cancelar playlist en el backend:", await response.text())
          toast({
            title: "Descarga de playlist detenida",
            description: "Se detuvo el proceso localmente.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error al cancelar playlist en el backend:", error)
        toast({
          title: "Descarga de playlist detenida",
          description: "Se detuvo el proceso localmente.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Descarga de playlist cancelada",
        description: "La descarga ha sido detenida.",
      })
    }

    setIsPlaylistPolling(false)
    currentJobIdRef.current = null
  }

  const resetPlaylistState = () => {
    setOverrideFiles([])
    setOverrideJobId(null)
    pollingStoppedRef.current = false
    currentJobIdRef.current = null
  }

  return {
    isPlaylistPolling,
    overrideFiles,
    overrideJobId,
    handlePlaylistDownload,
    cancelPlaylistDownload,
    resetPlaylistState,
  }
}
