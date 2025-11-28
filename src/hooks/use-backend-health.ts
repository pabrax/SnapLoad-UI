import { useState, useEffect } from "react"
import type { BackendStatus } from "@/src/types/api"

/**
 * Hook para verificar el estado de salud del backend
 */
export function useBackendHealth() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("unknown")

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch("/api/health")
        setBackendStatus(response.ok ? "connected" : "disconnected")
      } catch {
        setBackendStatus("disconnected")
      }
    }
    checkBackendHealth()
  }, [])

  return { backendStatus }
}
