import { Music } from "lucide-react"
import { NativeSelectField } from "@/src/components/ui/native-select"
import { AUDIO_FORMATS } from "@/src/constants/audio"

interface AudioFormatSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const OPTIONS = AUDIO_FORMATS.map((f) => ({ value: f.value, label: f.label }))

export function AudioFormatSelector({ value, onChange, disabled = false }: AudioFormatSelectorProps) {
  return (
    <NativeSelectField
      label="Formato de audio"
      icon={<Music aria-hidden="true" className="h-4 w-4" />}
      value={value}
      onValueChange={onChange}
      options={OPTIONS}
      disabled={disabled}
      hint={AUDIO_FORMATS.find((f) => f.value === value)?.description}
    />
  )
}
