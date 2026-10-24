import { SuccessBurst } from "@/src/components/features/shared/SuccessBurst"
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
    <div role="status" className="mt-5 space-y-3 rounded-2xl border-2 border-mint bg-mint/10 p-4">
      <div className="flex items-start gap-3">
        <SuccessBurst />
        <div className="flex-1">
          <p className="text-base font-bold text-mint mb-1">¡Descarga de video lista!</p>
          <p className="text-sm text-muted-foreground mb-2">
            Se produjeron archivos. Descarga el ZIP o archivos individuales.
          </p>
        </div>
      </div>
      
      <FileDownloadActions 
        jobId={jobId} 
        files={files.filter(f => f.name).map(f => ({ 
          name: f.name, 
          size_bytes: f.size 
        }))} 
        showIndividual={true}
        onClean={onClean}
      />
    </div>
  )
}
