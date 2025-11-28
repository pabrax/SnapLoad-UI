import { Settings } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { QUALITY_OPTIONS } from "@/src/constants/audio"

interface QualitySelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function QualitySelector({ value, onChange, disabled = false }: QualitySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Calidad de Audio
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-12 text-base bg-muted/50 border-2 border-muted focus:border-primary">
          <SelectValue placeholder="Selecciona la calidad" />
        </SelectTrigger>
        <SelectContent>
          {QUALITY_OPTIONS.map((option) => (
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
