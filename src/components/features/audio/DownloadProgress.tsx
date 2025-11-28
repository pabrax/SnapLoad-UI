interface DownloadProgressProps {
  isPlaylistPolling: boolean
  progressStatus?: string
  pollingMessage: string
}

export function DownloadProgress({ isPlaylistPolling, progressStatus, pollingMessage }: DownloadProgressProps) {
  return (
    <div className="mt-4 p-4 bg-muted/20 border-2 border-muted rounded-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-semibold">
          {isPlaylistPolling 
            ? 'Procesando playlist' 
            : (progressStatus === 'queued' ? 'En cola' : 'En progreso')}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{pollingMessage}</p>
    </div>
  )
}
