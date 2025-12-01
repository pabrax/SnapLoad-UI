// Backend base URL and helper to build absolute URLs

const RAW_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://127.0.0.1:8000").toString()

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  return `${b}${p}`
}

export const BACKEND_BASE_URL = RAW_BASE

export function backendUrl(path: string): string {
  return joinUrl(BACKEND_BASE_URL, path)
}
