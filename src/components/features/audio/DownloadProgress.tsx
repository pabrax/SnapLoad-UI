import { DOWNLOAD_MESSAGES, getDownloadStatusMessage } from "@/src/constants/messages"

interface DownloadProgressProps {
  isPlaylistPolling: boolean
  progressStatus?: string
  pollingMessage: string
}

// Deterministic bar profile: the backend reports no percentage, so the bars show activity, not a fake amount.
const BARS = Array.from({ length: 28 }, (_, i) => ({
  delay: (i * 137) % 900,
  duration: 700 + ((i * 53) % 500),
  rest: 0.3 + (((i * 7) % 10) / 10) * 0.6,
}))

export function DownloadProgress({ isPlaylistPolling, progressStatus, pollingMessage }: DownloadProgressProps) {
  // The loop runs only while the job is actually running; waiting in the queue shows resting bars.
  const running = progressStatus !== "queued"

  const getStatusLabel = () => {
    if (isPlaylistPolling) return DOWNLOAD_MESSAGES.PROCESSING.PLAYLIST_PROCESSING
    if (progressStatus === "queued") return DOWNLOAD_MESSAGES.PROCESSING.QUEUED
    if (progressStatus) return getDownloadStatusMessage(progressStatus, "audio")
    return DOWNLOAD_MESSAGES.PROCESSING.DOWNLOADING
  }

  return (
    <div role="status" aria-live="polite" aria-busy="true" className="mt-5 rounded-2xl border-2 border-mode bg-plum-raised p-4">
      <div aria-hidden="true" className="mb-3 flex h-14 items-end justify-between gap-1">
        {BARS.map((bar, i) => (
          <span
            key={i}
            className={`block h-full flex-1 rounded-full bg-mode ${running ? "eq-bar" : "eq-bar-idle"}`}
            style={
              {
                "--h": bar.rest,
                animationDelay: `${bar.delay}ms`,
                animationDuration: `${bar.duration}ms`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <p className="text-sm font-bold text-foreground">{getStatusLabel()}</p>
      <p className="text-xs text-muted-foreground">{pollingMessage}</p>
    </div>
  )
}
