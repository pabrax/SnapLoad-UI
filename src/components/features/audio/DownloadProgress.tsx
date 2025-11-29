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
    <div className="mt-4 p-4 bg-muted/20 border-2 border-muted rounded-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-semibold">
          {getStatusLabel()}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{pollingMessage}</p>
    </div>
  )
}
