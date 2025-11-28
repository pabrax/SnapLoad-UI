import { useState } from "react"
import { POLLING_INTERVAL } from "@/src/constants/audio"
import { isPlaylistUrl } from "@/src/lib/utils/download-helpers"
import type { ProducedFile } from "@/src/types/api"

interface UseAudioDownloadReturn {
  isPlaylistPolling: boolean
  overrideFiles: ProducedFile[]
  overrideJobId: string | null
  handlePlaylistDownload: (url: string, quality: string) => Promise<boolean>
  resetPlaylistState: () => void
}

/**
 * Hook para manejar la lógica de descarga de audio (playlists y singles)
 */
export function useAudioDownload(): UseAudioDownloadReturn {
  const [isPlaylistPolling, setIsPlaylistPolling] = useState(false)
  const [overrideFiles, setOverrideFiles] = useState<ProducedFile[]>([])
  const [overrideJobId, setOverrideJobId] = useState<string | null>(null)

  const handlePlaylistDownload = async (url: string, quality: string): Promise<boolean> => {
    if (!isPlaylistUrl(url)) {
      return false
    }

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
      let finished = false
      while (!finished) {
        await new Promise((r) => setTimeout(r, POLLING_INTERVAL))
        
        try {
          const sres = await fetch(`/api/status/${encodeURIComponent(jobId)}`)
          if (!sres.ok) continue
          
          const sdata = await sres.json()
          const st = (sdata.status || sdata.meta?.status || '').toLowerCase()
          
          if (['success', 'failed', 'cancelled'].includes(st)) {
            finished = true
            if (st !== 'success') {
              throw new Error(sdata.meta?.error || 'Job finalizado con error')
            }
          }
        } catch (e) {
          console.warn('Polling error', e)
        }
      }

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
      
      return true
    } catch (err) {
      console.error('Playlist download error', err)
      setIsPlaylistPolling(false)
      throw err
    }
  }

  const resetPlaylistState = () => {
    setOverrideFiles([])
    setOverrideJobId(null)
  }

  return {
    isPlaylistPolling,
    overrideFiles,
    overrideJobId,
    handlePlaylistDownload,
    resetPlaylistState,
  }
}
