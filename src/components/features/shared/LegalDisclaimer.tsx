import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip"

export function DisclaimerBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/40 border border-slate-700/40 text-xs text-muted-foreground/80 cursor-help hover:bg-slate-800/60 hover:text-muted-foreground transition-all">
            <Info className="h-3 w-3" />
            <span>Uso Educativo</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs leading-relaxed">
            Software educativo de código abierto. El usuario es responsable de cumplir 
            con leyes y Términos de Servicio. No alojamos ni distribuimos contenido protegido.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function Footer() {
  return (
    <footer className="mt-8 mb-4 text-center space-y-1">
      <p className="text-xs text-muted-foreground/60">
        Uso educativo y personal · El usuario asume toda responsabilidad
      </p>
    </footer>
  )
}
