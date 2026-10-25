import { Link2, Music, Youtube } from "lucide-react"
import { DOWNLOAD_MESSAGES } from "@/src/constants/messages"
import type { AudioInfoResponse } from "@/src/types/api"

interface AudioInfoPreviewProps {
  audioInfo: AudioInfoResponse | null
  loading?: boolean
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`
}

/** "Tape label": a light, slightly tilted card with the cover on the left. Skeleton shimmers while fetching. */
export function AudioInfoPreview({ audioInfo, loading = false }: AudioInfoPreviewProps) {
  if (loading) {
    return (
      <div role="status" className="-rotate-1 rounded-2xl border-2 border-dashed border-surface-border bg-plum-raised p-3">
        <span className="sr-only">{DOWNLOAD_MESSAGES.PROCESSING.FETCHING_INFO}</span>
        <div aria-hidden="true" className="flex items-center gap-3">
          <div className="shimmer size-16 shrink-0 rounded-xl bg-plum-surface" />
          <div className="flex-1 space-y-2">
            <div className="shimmer h-4 w-3/4 rounded-full bg-plum-surface" />
            <div className="shimmer h-3 w-1/2 rounded-full bg-plum-surface" />
          </div>
        </div>
      </div>
    )
  }

  if (!audioInfo || !audioInfo.success || !audioInfo.metadata) {
    return null
  }

  const { title, artist, platform, duration, thumbnail } = audioInfo.metadata
  const PLATFORM_NAME: Record<string, string> = { youtube: "YouTube", spotify: "Spotify" }
  const platformName = platform ? PLATFORM_NAME[platform.toLowerCase()] : undefined
  const safeThumb = thumbnail && /^(https?:|data:image\/)/.test(thumbnail) ? thumbnail : null

  // The backend may only know the platform. Never invent a title: say what is true (the link is valid).
  if (!title && !artist && !safeThumb) {
    const PlatformIcon = platformName === "YouTube" ? Youtube : Link2
    return (
      <div role="status" className="-rotate-1 rounded-2xl border-2 border-cassette bg-cassette p-3 text-plum shadow-[4px_4px_0_var(--sun)]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-plum bg-sun">
            <PlatformIcon className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold">{platformName ? `Enlace de ${platformName} listo` : "Enlace listo"}</p>
            <p className="text-sm text-plum/80">Elige formato y calidad, y pulsa Descargar.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="-rotate-1 rounded-2xl border-2 border-cassette bg-cassette p-3 text-plum shadow-[4px_4px_0_var(--sun)]">
      <div className="flex items-center gap-3">
        {safeThumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={safeThumb} alt="" width={64} height={64} className="size-16 shrink-0 rounded-xl border-2 border-plum object-cover" />
        ) : (
          <span aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-xl border-2 border-plum bg-sun">
            <Music className="size-7" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{title ?? "Sin título"}</p>
          {artist && <p className="truncate text-sm text-plum/80">{artist}</p>}
          <div className="mt-1.5 flex flex-wrap gap-2 text-xs font-bold">
            {platform && <span className="rounded-full bg-plum px-2.5 py-0.5 text-cassette">{platformName ?? platform}</span>}
            {duration ? <span className="rounded-full border-2 border-plum px-2.5 py-0.5 tabular-nums">{formatDuration(duration)}</span> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
