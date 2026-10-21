import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { availableResolutions } from "@/src/lib/media-options"

interface VideoResolutionSelectorProps {
  value: string
  format: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function VideoResolutionSelector({ value, format, onChange, disabled = false }: VideoResolutionSelectorProps) {
  const options = availableResolutions(format)
  const capped = options.length < 7

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
        Resolución
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-12 text-base bg-muted/50 border-2 border-muted focus:border-primary">
          <SelectValue placeholder="Selecciona resolución" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="font-medium">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {capped
          ? "MOV y AVI se generan copiando H.264 + AAC (sin recodificar), por eso llegan hasta 1080p."
          : "Si el video no tiene la resolución elegida se descarga la más alta disponible por debajo."}
      </p>
    </div>
  )
}
