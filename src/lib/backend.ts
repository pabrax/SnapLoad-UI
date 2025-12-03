// Backend base URL and helper to build absolute URLs

// Detectar si estamos en modo desarrollo o producción
const isDevelopment = process.env.NODE_ENV === 'development'
const isDocker = process.env.DOCKER_ENV === 'true' || process.env.HOSTNAME === '0.0.0.0'

// Para server-side (Next.js server) usa la red interna de Docker o localhost
// Para client-side (navegador) usa la URL pública
const getBackendUrl = () => {
  // Client-side (navegador)
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9020'
  }
  
  // Server-side (Next.js server)
  // Si estamos en Docker, usar la red interna
  if (isDocker) {
    return process.env.BACKEND_INTERNAL_URL || 'http://snapload-api:8000'
  }
  
  // Si estamos en desarrollo local, usar localhost
  if (isDevelopment) {
    return process.env.BACKEND_INTERNAL_URL || 'http://localhost:9020'
  }
  
  // Fallback: intentar red interna Docker
  return process.env.BACKEND_INTERNAL_URL || 'http://snapload-api:8000'
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
