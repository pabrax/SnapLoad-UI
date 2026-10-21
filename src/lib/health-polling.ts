/**
 * Calendario de recomprobación del backend: reintentos rápidos con backoff mientras no responde
 * (3, 6, 12, 24 y 30 s como máximo) y un latido lento cuando está conectado.
 */
export function nextHealthDelay(status: "connected" | "disconnected" | "unknown", failures: number): number {
  if (status === "connected") return 60_000
  return Math.min(30_000, 3_000 * 2 ** Math.max(0, failures))
}
