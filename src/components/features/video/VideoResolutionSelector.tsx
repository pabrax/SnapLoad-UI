import { NativeSelectField } from "@/src/components/ui/native-select"
import { availableResolutions } from "@/src/lib/media-options"

interface VideoResolutionSelectorProps {
  value: string
  format: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function VideoResolutionSelector({ value, format, onChange, disabled = false }: VideoResolutionSelectorProps) {
  const options = availableResolutions(format).map((r) => ({ value: r.value, label: r.label }))
  const capped = options.length < 7

  return (
    <NativeSelectField
      label="Resolución"
      value={value}
      onValueChange={onChange}
      options={options}
      disabled={disabled}
      hint={
        capped
          ? "MOV y AVI se generan copiando H.264 + AAC (sin recodificar), por eso llegan hasta 1080p."
          : "Si el video no tiene la resolución elegida se descarga la más alta disponible por debajo."
      }
    />
  )
}
