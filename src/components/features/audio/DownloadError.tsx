import { AlertCircle } from "lucide-react"
import { Button } from "@/src/components/ui/button"

interface DownloadErrorProps {
  error: string | null
  onClose: () => void
}

export function DownloadError({ error, onClose }: DownloadErrorProps) {
  if (!error) return null

  return (
    <div role="alert" className="shake-once mt-5 flex items-start gap-3 rounded-2xl border-2 border-dashed border-tomato bg-tomato/10 p-4">
      <AlertCircle aria-hidden="true" className="mt-0.5 h-6 w-6 flex-shrink-0 text-tomato" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-tomato">Error</p>
        <p className="mt-1 max-h-40 overflow-y-auto break-words text-sm text-foreground whitespace-pre-line">{error}</p>
      </div>
      <Button type="button" size="sm" variant="outline" onClick={onClose} className="min-h-11 rounded-full border-tomato text-tomato hover:bg-tomato hover:text-plum">
        Cerrar
      </Button>
    </div>
  )
}
