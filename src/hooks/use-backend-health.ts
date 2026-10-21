import { useState, useEffect } from "react"
import type { BackendStatus } from "@/src/types/api"
import { nextHealthDelay } from "@/src/lib/health-polling"

/**
 * Hook para verificar el estado de salud del backend.
 * Reintenta con backoff si no responde (el API puede arrancar después que el UI),
 * mantiene un latido lento si está conectado y recomprueba al volver a la pestaña.
 */
export function useBackendHealth() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("unknown")

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let failures = 0
    let cancelled = false

    const check = async () => {
      let status: BackendStatus
      try {
        const response = await fetch("/api/health", { cache: "no-store" })
        status = response.ok ? "connected" : "disconnected"
      } catch {
        status = "disconnected"
      }
      if (cancelled) return

      failures = status === "connected" ? 0 : failures + 1
      setBackendStatus(status)
      schedule(status)
    }

    const schedule = (status: BackendStatus) => {
      clearTimeout(timer)
      timer = setTimeout(check, nextHealthDelay(status, Math.max(0, failures - 1)))
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer)
        check()
      }
    }

    check()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      cancelled = true
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  return { backendStatus }
}
