import { Settings } from "lucide-react"
import { NativeSelectField } from "@/src/components/ui/native-select"
import { QUALITY_OPTIONS } from "@/src/constants/audio"
import { bitrateApplies, bitrateNote } from "@/src/lib/media-options"

interface QualitySelectorProps {
  value: string
  format: string
  onChange: (value: string) => void
  disabled?: boolean
}

const OPTIONS = QUALITY_OPTIONS.map((q) => ({ value: q.value, label: `${q.label} · ${q.description}` }))

export function QualitySelector({ value, format, onChange, disabled = false }: QualitySelectorProps) {
  return (
    <NativeSelectField
      label="Calidad de audio"
      icon={<Settings aria-hidden="true" className="h-4 w-4" />}
      value={value}
      onValueChange={onChange}
      options={OPTIONS}
      disabled={disabled || !bitrateApplies(format)}
      hint={
        bitrateNote(format) ??
        "El audio de YouTube llega a ~128 kbps; un bitrate mayor recodifica y agranda el archivo sin mejorar la fidelidad."
      }
    />
  )
}
