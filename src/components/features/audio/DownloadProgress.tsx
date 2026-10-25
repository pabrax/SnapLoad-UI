import { DOWNLOAD_MESSAGES, getDownloadStatusMessage } from "@/src/constants/messages"
import { useScrollIntoView } from "@/src/components/features/shared/use-scroll-into-view"

interface DownloadProgressProps {
  isPlaylistPolling: boolean
  progressStatus?: string
}

// Deterministic bar profile: the backend reports no percentage, so the bars show activity, not a fake amount.
const BARS = Array.from({ length: 28 }, (_, i) => ({
  delay: (i * 137) % 900,
  duration: 700 + ((i * 53) % 500),
  rest: 0.3 + (((i * 7) % 10) / 10) * 0.6,
}))

/** One wording for the stage, shared by the button and the panel so they never disagree. */
export function stageLabel(progressStatus: string | undefined, isPlaylistPolling = false): string {
  if (isPlaylistPolling) return DOWNLOAD_MESSAGES.PROCESSING.PLAYLIST_PROCESSING
  if (progressStatus === "queued") return DOWNLOAD_MESSAGES.PROCESSING.QUEUED
  if (progressStatus) return getDownloadStatusMessage(progressStatus, "audio")
  return DOWNLOAD_MESSAGES.PROCESSING.DOWNLOADING
}

export function DownloadProgress({ isPlaylistPolling, progressStatus }: DownloadProgressProps) {
  const ref = useScrollIntoView<HTMLDivElement>()
  // The loop runs only while the job is actually running; waiting in the queue shows resting bars.
  const running = progressStatus !== "queued"

  return (
    <div ref={ref} role="status" aria-live="polite" aria-busy="true" className="mt-5 rounded-2xl border-2 border-mode bg-plum-raised p-4">
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
      <p className="text-sm font-bold text-foreground">{stageLabel(progressStatus, isPlaylistPolling)}</p>
      <p className="text-xs text-muted-foreground">
        {progressStatus === "queued" ? "Empezará en cuanto haya un hueco en el servidor." : "Mantén esta pestaña abierta hasta que termine."}
      </p>
    </div>
  )
}
