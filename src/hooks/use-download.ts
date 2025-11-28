"use client"

import { useState, useCallback } from "react"
import type { AudioInfoResponse } from "@/src/types/api"

export interface UseDownloadResult {
  isLoading: boolean
  error: string | null
  getAudioInfo: (url: string) => Promise<AudioInfoResponse | null>
  clearError: () => void
}

export function useDownload(): UseDownloadResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getAudioInfo = useCallback(async (url: string): Promise<AudioInfoResponse | null> => {
    try {
      setError(null)
      const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al obtener información")
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      return null
    }
  }, [])

  return {
    isLoading,
    error,
    getAudioInfo,
    clearError
  }
}