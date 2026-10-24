import { Github } from "lucide-react"
import type { BackendStatus } from "@/src/types/api"

interface FeatureBadgesProps {
  backendStatus?: BackendStatus
}

const STATUS_VIEW: Record<string, { label: string; dot: string; chip: string }> = {
  connected: {
    label: "Servidor conectado",
    dot: "bg-mint",
    chip: "border-mint/50 bg-mint/10 text-mint",
  },
  disconnected: {
    label: "Servidor desconectado",
    dot: "bg-tomato",
    chip: "border-tomato/50 bg-tomato/10 text-tomato",
  },
  unknown: {
    label: "Verificando servidor…",
    dot: "bg-sun animate-pulse",
    chip: "border-sun/50 bg-sun/10 text-sun",
  },
}

export function FeatureBadges({ backendStatus = "unknown" }: FeatureBadgesProps) {
  const view = STATUS_VIEW[backendStatus] ?? STATUS_VIEW.unknown

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <p
        role="status"
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${view.chip}`}
      >
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${view.dot}`} />
        {view.label}
      </p>
      <p className="rounded-full border border-surface-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground">
        YouTube y Spotify
      </p>
      <p className="rounded-full border border-surface-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground">
        Audio y video hasta 4K
      </p>
      <a
        href="https://github.com/pabrax/SnapLoad"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-surface-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:bg-plum-raised hover:text-mode focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Github aria-hidden="true" className="h-4 w-4" />
        GitHub
        <span className="sr-only">(se abre en una pestaña nueva)</span>
      </a>
    </div>
  )
}
