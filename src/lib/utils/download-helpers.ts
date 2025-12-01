import { DOWNLOAD_DELAY } from "@/src/constants/audio"
import type { ProducedFile } from "@/src/types/api"

/**
 * Descarga un archivo individual desde el backend
 */
export async function downloadFile(jobId: string, filename: string): Promise<void> {
  try {
    const res = await fetch(`/api/files/${encodeURIComponent(jobId)}/download/${encodeURIComponent(filename)}`)
    if (!res.ok) throw new Error(`status ${res.status}`)
    
    const blob = await res.blob()
    const urlObj = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = urlObj
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(urlObj)
    document.body.removeChild(a)
  } catch (e) {
    console.error('Download file error:', filename, e)
    throw e
  }
}

/**
 * Descarga un archivo ZIP con todos los archivos del job
 */
export async function downloadZip(jobId: string): Promise<void> {
  try {
    const res = await fetch(`/api/files/${encodeURIComponent(jobId)}/archive`)
    if (!res.ok) throw new Error(`ZIP status ${res.status}`)
    
    const blob = await res.blob()
    const urlObj = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = urlObj
    a.download = `${jobId}.zip`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(urlObj)
    document.body.removeChild(a)
  } catch (e) {
    console.error('Download ZIP error:', e)
    throw e
  }
}

/**
 * Descarga todos los archivos de forma secuencial
 */
export async function downloadAllFiles(jobId: string, files: ProducedFile[]): Promise<void> {
  if (!jobId || !files.length) return
  
  for (const file of files) {
    try {
      await downloadFile(jobId, file.name)
      await new Promise(r => setTimeout(r, DOWNLOAD_DELAY))
    } catch (e) {
      console.error('Download all files error:', file.name, e)
    }
  }
}

/**
 * Valida si una URL es de tipo playlist
 */
export function isPlaylistUrl(url: string): boolean {
  const s = url.toLowerCase()
  return s.includes('/playlist') || s.includes('/album') || s.includes('playlist?list=')
}
