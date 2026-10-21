import { AlertCircle } from "lucide-react"
import { Button } from "@/src/components/ui/button"

interface DownloadErrorProps {
  error: string | null
  onClose: () => void
}

export function DownloadError({ error, onClose }: DownloadErrorProps) {
  if (!error) return null

  return (
    <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-destructive bg-destructive/15 p-4">
      <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-red-300">Error</p>
        <p className="mt-1 max-h-40 overflow-y-auto break-words text-xs text-red-200 whitespace-pre-line">{error}</p>
      </div>
      <Button type="button" size="sm" variant="outline" onClick={onClose} className="min-h-10">
        Cerrar
      </Button>
    </div>
  )
}
