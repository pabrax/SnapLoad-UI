import { useState, useCallback } from 'react'
import { ZipDownloadResponse } from '@/src/types/api'

interface UseZipDownloadReturn {
  isCreatingZip: boolean
  zipError: string | null
  createZip: (downloadId: string) => Promise<ZipDownloadResponse>
  downloadZip: (zipFile: string) => void
  zipFile: string | null
  clearError: () => void
}

export function useZipDownload(): UseZipDownloadReturn {
  const [isCreatingZip, setIsCreatingZip] = useState(false)
  const [zipError, setZipError] = useState<string | null>(null)
  const [zipFile, setZipFile] = useState<string | null>(null)

  const createZip = useCallback(async (downloadId: string): Promise<ZipDownloadResponse> => {
    // The backend exposes an archive endpoint per job: /files/{jobId}/archive
    // We don't create a separate ZIP job; calling the archive URL will generate and return the ZIP file.
    setIsCreatingZip(true)
    setZipError(null)
    try {
      setZipFile(`/api/files/${downloadId}/archive`)
      return { success: true, zip_url: `/api/files/${downloadId}/archive` } as unknown as ZipDownloadResponse
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setZipError(errorMessage)
      throw error
    } finally {
      setIsCreatingZip(false)
    }
  }, [])

  const downloadZip = useCallback((zipFile: string) => {
    try {
      const filename = zipFile.split('/').pop() || 'playlist.zip'
      const downloadUrl = zipFile // already a proxied URL like /api/files/{jobId}/archive
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error triggering download:', error)
      setZipError('Error downloading ZIP file')
    }
  }, [])

  // cleanupFiles and moveFilesExternal were removed — backend does not expose these operations.

  const clearError = useCallback(() => {
    setZipError(null)
  }, [])

  return {
    isCreatingZip,
    zipError,
    zipFile,
    createZip,
    downloadZip,
    clearError
  }
}