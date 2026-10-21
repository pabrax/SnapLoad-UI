import { Github } from "lucide-react"
import type { BackendStatus } from "@/src/types/api"

interface FeatureBadgesProps {
  backendStatus?: BackendStatus
}

const STATUS_VIEW: Record<string, { label: string; dot: string; chip: string }> = {
  connected: {
    label: "Servidor conectado",
    dot: "bg-emerald-400",
    chip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  },
  disconnected: {
    label: "Servidor desconectado",
    dot: "bg-red-400",
    chip: "border-red-500/40 bg-red-500/10 text-red-200",
  },
  unknown: {
    label: "Verificando servidor…",
    dot: "bg-amber-400 animate-pulse",
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-200",
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
      <p className="rounded-full border border-surface-border bg-surface px-3 py-1.5 text-xs font-semibold text-slate-200">
        YouTube y Spotify
      </p>
      <p className="rounded-full border border-surface-border bg-surface px-3 py-1.5 text-xs font-semibold text-slate-200">
        Audio y video hasta 4K
      </p>
      <a
        href="https://github.com/pabrax/SnapLoad"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-surface-border bg-surface px-4 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Github aria-hidden="true" className="h-4 w-4" />
        GitHub
        <span className="sr-only">(se abre en una pestaña nueva)</span>
      </a>
    </div>
  )
}
