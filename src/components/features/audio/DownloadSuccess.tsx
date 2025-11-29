import { CheckCircle2 } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { FileDownloadActions } from "@/src/components/features/shared/FileDownloadActions"
import { downloadFile } from "@/src/lib/utils/download-helpers"
import { DOWNLOAD_MESSAGES, FILE_MESSAGES } from "@/src/constants/messages"
import type { ProducedFile, AudioInfoResponse } from "@/src/types/api"

interface DownloadSuccessProps {
  files: ProducedFile[]
  jobId: string | null
  quality: string
  audioInfo: AudioInfoResponse | null
  fileDownloaded?: boolean
  onClean?: () => void
}

export function DownloadSuccess({ 
  files, 
  jobId, 
  quality, 
  audioInfo,
  fileDownloaded,
  onClean 
}: DownloadSuccessProps) {
  const isSingleFile = files.length <= 1

  const handleDownloadSingleFile = async (filename: string) => {
    if (!jobId) return
    try {
      await downloadFile(jobId, filename)
    } catch (e) {
      console.error('Single file download error:', e)
    }
  }

  if (isSingleFile) {
    // Canción individual
    return (
      <div className="mt-4 p-4 bg-primary/15 border-2 border-primary rounded-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-primary mb-1">{DOWNLOAD_MESSAGES.SUCCESS.AUDIO_SINGLE}</p>
            <p className="text-xs text-primary/80 mb-2">
              {fileDownloaded 
                ? DOWNLOAD_MESSAGES.SUCCESS.AUTO_DOWNLOAD
                : DOWNLOAD_MESSAGES.PROCESSING.FINALIZING}
            </p>
            <div className="flex flex-wrap gap-1">
              {quality && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                  {quality} kbps
                </Badge>
              )}
              {audioInfo?.metadata?.platform && (
                <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                  {audioInfo.metadata.platform}
                </Badge>
              )}
            </div>
            
            {/* Mostrar nombre + acciones también en single */}
            {files.length > 0 && jobId && (
              <div className="mt-3 space-y-2">
                <ul className="space-y-1">
                  {files.slice(0, 1).map(f => (
                    <li 
                      key={f.name} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs bg-primary/5 px-3 py-2 rounded-lg border border-primary/10"
                    >
                      <span className="break-words overflow-hidden w-full sm:max-w-[70%] sm:truncate" title={f.name}>{f.name}</span>
                      <div className="flex items-center gap-2 justify-end flex-shrink-0">
                        <span className="text-[10px] opacity-70">
                          {f.size_bytes ? `${Math.round(f.size_bytes / 1024)} KB` : ''}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadSingleFile(f.name)}
                        >
                          Descargar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <FileDownloadActions 
                  jobId={jobId} 
                  files={files.slice(0, 1)} 
                  showIndividual={false}
                  onClean={onClean}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Playlist/varios archivos
  return (
    <div className="mt-4 p-4 bg-primary/15 border-2 border-primary rounded-lg backdrop-blur-sm space-y-3">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold text-primary mb-1">¡Descarga exitosa!</p>
          <p className="text-xs text-primary/80 mb-2">
            Se produjeron varios archivos. Descarga el ZIP o archivos individuales.
          </p>
          <div className="flex flex-wrap gap-1">
            {quality && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                {quality} kbps
              </Badge>
            )}
            {audioInfo?.metadata?.platform && (
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                {audioInfo.metadata.platform}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <FileDownloadActions 
        jobId={jobId} 
        files={files} 
        showIndividual={true}
        onClean={onClean}
      />
    </div>
  )
}
