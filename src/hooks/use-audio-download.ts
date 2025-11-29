import { useState, useRef } from "react"
import { useToast } from "@/src/hooks/use-toast"
import { useErrorHandler } from "@/src/hooks/use-error-handler"
import { pollJobStatus, enqueueDownload } from "@/src/lib/utils/polling-helpers"
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
  const { handleError } = useErrorHandler()

  const handlePlaylistDownload = async (url: string, quality: string) => {
    if (!isPlaylistUrl(url)) {
      return false
    }

    try {
      setIsPlaylistPolling(true)
      pollingStoppedRef.current = false
      
      const jobId = await enqueueDownload(url, { quality })
      currentJobIdRef.current = jobId

      await pollJobStatus({
        jobId,
        shouldStop: () => pollingStoppedRef.current,
        onSuccess: async (files) => {
          setOverrideFiles(files.map(f => ({ 
            name: f.name, 
            size_bytes: f.size_bytes 
          })))
          setOverrideJobId(jobId)
          setIsPlaylistPolling(false)
        },
        onError: (error) => {
          handleError(error, { 
            context: 'Playlist polling',
            customMessage: 'Error al procesar la playlist'
          })
          setIsPlaylistPolling(false)
        }
      })
      
      return true
    } catch (err) {
      handleError(err, { 
        context: 'Playlist download',
        customMessage: 'Error al descargar la playlist'
      })
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
          toast({
            title: "Descarga de playlist cancelada",
            description: "La descarga de la playlist ha sido cancelada exitosamente.",
          })
        } else {
          handleError("No se pudo cancelar playlist en el backend", {
            showToast: true,
            customMessage: "Se detuvo el proceso localmente."
          })
        }
      } catch (error) {
        handleError(error, {
          context: 'Cancel playlist',
          customMessage: 'Se detuvo el proceso localmente.'
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
