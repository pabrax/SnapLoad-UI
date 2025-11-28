import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { VIDEO_FORMATS } from "@/src/constants/video"

interface VideoFormatSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function VideoFormatSelector({ value, onChange, disabled = false }: VideoFormatSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
        Formato de Video
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-12 text-base bg-muted/50 border-2 border-muted focus:border-primary">
          <SelectValue placeholder="Selecciona formato" />
        </SelectTrigger>
        <SelectContent>
          {VIDEO_FORMATS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="font-medium">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
