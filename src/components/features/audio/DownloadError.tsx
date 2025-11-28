import { AlertCircle } from "lucide-react"
import { Button } from "@/src/components/ui/button"

interface DownloadErrorProps {
  error: string | null
  onClose: () => void
}

export function DownloadError({ error, onClose }: DownloadErrorProps) {
  if (!error) return null

  return (
    <div className="mt-4 p-4 bg-destructive/15 border-2 border-destructive rounded-lg flex items-start gap-3 backdrop-blur-sm">
      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-bold text-destructive">Error</p>
        <p className="text-xs text-destructive/80 mt-1 whitespace-pre-line">
          {error}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onClose}
      >
        Cerrar
      </Button>
    </div>
  )
}
