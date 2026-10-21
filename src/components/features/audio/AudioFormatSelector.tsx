import { Music } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { AUDIO_FORMATS } from "@/src/constants/audio"

interface AudioFormatSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function AudioFormatSelector({ value, onChange, disabled = false }: AudioFormatSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
        <Music className="w-4 h-4" />
        Formato de Audio
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-12 text-base bg-muted/50 border-2 border-muted focus:border-primary">
          <SelectValue placeholder="Selecciona el formato" />
        </SelectTrigger>
        <SelectContent>
          {AUDIO_FORMATS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{option.label}</span>
                <span className="text-sm text-muted-foreground ml-2">{option.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
