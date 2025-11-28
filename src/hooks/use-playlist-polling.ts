import { useState, useEffect } from "react"
import { POLLING_INTERVAL } from "@/src/constants/audio"

const POLLING_MESSAGES = [
  'Conectando con el servidor…',
  'Obteniendo información…',
  'Descargando…',
  'Codificando…',
  'Preparando archivos…',
]

interface UsePlaylistPollingProps {
  isActive: boolean
  progressStatus?: string
  progressMessage?: string | null
}

/**
 * Hook para manejar el polling de playlists y mostrar mensajes rotativos
 */
export function usePlaylistPolling({ isActive, progressStatus, progressMessage }: UsePlaylistPollingProps) {
  const [pollingTick, setPollingTick] = useState(0)

  // Tick to rotate informative messages during polling
  useEffect(() => {
    const polling = isActive || progressStatus === 'queued' || progressStatus === 'running'
    if (!polling) return
    
    const id = setInterval(() => setPollingTick((t) => t + 1), 3000)
    return () => clearInterval(id)
  }, [isActive, progressStatus])

  const getMessage = (): string => {
    const idx = pollingTick % POLLING_MESSAGES.length
    
    if (progressMessage) return progressMessage
    if (progressStatus === 'queued') return 'Descarga encolada'
    
    return POLLING_MESSAGES[idx]
  }

  return {
    pollingMessage: getMessage(),
  }
}
