import { NativeSelectField } from "@/src/components/ui/native-select"
import { VIDEO_FORMATS } from "@/src/constants/video"

interface VideoFormatSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const OPTIONS = VIDEO_FORMATS.map((f) => ({ value: f.value, label: f.label }))

export function VideoFormatSelector({ value, onChange, disabled = false }: VideoFormatSelectorProps) {
  return (
    <NativeSelectField
      label="Formato de video"
      value={value}
      onValueChange={onChange}
      options={OPTIONS}
      disabled={disabled}
      hint={VIDEO_FORMATS.find((f) => f.value === value)?.description}
    />
  )
}
