// Backend base URL and helper to build absolute URLs

// Para server-side (Next.js server) usa la red interna de Docker
// Para client-side (navegador) usa la URL pública
const getBackendUrl = () => {
  // Server-side: usar red interna Docker
  if (typeof window === 'undefined') {
    return process.env.BACKEND_INTERNAL_URL || 'http://snapload-api:8000'
  }
  // Client-side: usar URL pública o fallback
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
}

const RAW_BASE = getBackendUrl()

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  return `${b}${p}`
}

export const BACKEND_BASE_URL = RAW_BASE

export function backendUrl(path: string): string {
  return joinUrl(BACKEND_BASE_URL, path)
}
