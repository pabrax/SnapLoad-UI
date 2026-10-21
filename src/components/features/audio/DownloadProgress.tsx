import { DOWNLOAD_MESSAGES, getDownloadStatusMessage } from "@/src/constants/messages"

interface DownloadProgressProps {
  isPlaylistPolling: boolean
  progressStatus?: string
  pollingMessage: string
}

export function DownloadProgress({ isPlaylistPolling, progressStatus, pollingMessage }: DownloadProgressProps) {
  const getStatusLabel = () => {
    if (isPlaylistPolling) return DOWNLOAD_MESSAGES.PROCESSING.PLAYLIST_PROCESSING
    if (progressStatus === 'queued') return DOWNLOAD_MESSAGES.PROCESSING.QUEUED
    if (progressStatus) return getDownloadStatusMessage(progressStatus, "audio")
    return DOWNLOAD_MESSAGES.PROCESSING.DOWNLOADING
  }

  return (
    <div role="status" aria-live="polite" aria-busy="true" className="mt-4 rounded-lg border border-surface-border bg-slate-800/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span aria-hidden="true" className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
        <span className="text-sm font-semibold">{getStatusLabel()}</span>
      </div>
      <p className="text-xs text-slate-300">{pollingMessage}</p>
    </div>
  )
}
