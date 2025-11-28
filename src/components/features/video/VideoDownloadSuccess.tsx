import { CheckCircle2 } from "lucide-react"
import { FileDownloadActions } from "@/src/components/features/shared/FileDownloadActions"
import type { VideoFile } from "@/src/types/api"

interface VideoDownloadSuccessProps {
  files: VideoFile[]
  jobId: string | null
  onClean?: () => void
}

export function VideoDownloadSuccess({ files, jobId, onClean }: VideoDownloadSuccessProps) {
  if (!files.length) return null

  return (
    <div className="mt-4 p-4 bg-primary/15 border-2 border-primary rounded-lg backdrop-blur-sm space-y-3">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold text-primary mb-1">¡Descarga de video lista!</p>
          <p className="text-xs text-primary/80 mb-2">
            Se produjeron archivos. Descarga el ZIP o archivos individuales.
          </p>
        </div>
      </div>
      
      <FileDownloadActions 
        jobId={jobId} 
        files={files.map(f => ({ name: f.name, size_bytes: f.size }))} 
        showIndividual={true}
        onClean={onClean}
      />
    </div>
  )
}
