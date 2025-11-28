import { Github, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip"
import type { BackendStatus } from "@/src/types/api"

interface FeatureBadgesProps {
  backendStatus?: BackendStatus
}

export function FeatureBadges({ backendStatus = "checking" }: FeatureBadgesProps) {
  const getStatusStyles = () => {
    switch (backendStatus) {
      case "connected":
        return "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
      case "disconnected":
        return "bg-red-500/20 border-red-500/40 text-red-300"
      default:
        return "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
    }
  }

  const getStatusText = () => {
    switch (backendStatus) {
      case "connected":
        return "🟢 Conectado"
      case "disconnected":
        return "🔴 Desconectado"
      default:
        return "🟡 Verificando..."
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <div className={`px-3 py-1.5 ${getStatusStyles()} border rounded-full backdrop-blur-sm`}>
        <p className="text-xs font-bold">{getStatusText()}</p>
      </div>
      <div className="px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-full backdrop-blur-sm">
        <p className="text-xs font-bold text-primary">YouTube • Spotify</p>
      </div>
      <div className="px-3 py-1.5 bg-secondary/20 border border-secondary/40 rounded-full backdrop-blur-sm">
        <p className="text-xs font-bold text-secondary">Audio & Video HD</p>
      </div>
      <div className="px-3 py-1.5 bg-accent/20 border border-accent/40 rounded-full backdrop-blur-sm">
        <p className="text-xs font-bold text-accent">100% Seguro</p>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full backdrop-blur-sm cursor-help hover:bg-amber-500/30 transition-colors">
              <div className="flex items-center gap-1.5">
                <Info className="w-3 h-3 text-amber-400" />
                <p className="text-xs font-bold text-amber-300">Uso Educativo</p>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs leading-relaxed">
              Software educativo de código abierto. El usuario es responsable de cumplir 
              con leyes y Términos de Servicio. No alojamos ni distribuimos contenido protegido.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <a 
        href="https://github.com/pabrax/SnapLoad" 
        target="_blank" 
        rel="noopener noreferrer"
        className="px-3 py-1.5 bg-slate-700/40 border border-slate-500/40 rounded-full backdrop-blur-sm hover:bg-slate-600/50 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-1.5">
          <Github className="w-3 h-3 text-slate-300 group-hover:text-white transition-colors" />
          <p className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
            Github
          </p>
        </div>
      </a>
    </div>
  )
}
