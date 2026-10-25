import { useScrollIntoView } from "@/src/components/features/shared/use-scroll-into-view"
import { SuccessBurst } from "@/src/components/features/shared/SuccessBurst"
import { Button } from "@/src/components/ui/button"
import { FileDownloadActions } from "@/src/components/features/shared/FileDownloadActions"
import { downloadFile } from "@/src/lib/utils/download-helpers"
import { describeAudioQuality } from "@/src/lib/media-options"
import { DOWNLOAD_MESSAGES, FILE_MESSAGES } from "@/src/constants/messages"
import type { ProducedFile, AudioInfoResponse } from "@/src/types/api"

interface DownloadSuccessProps {
  files: ProducedFile[]
  jobId: string | null
  quality: string
  format: string
  audioInfo: AudioInfoResponse | null
  fileDownloaded?: boolean
  onClean?: () => void
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-mint/60 px-2.5 py-0.5 text-xs font-semibold text-mint">{children}</span>
}

export function DownloadSuccess({ 
  files, 
  jobId, 
  quality,
  format,
  audioInfo,
  fileDownloaded,
  onClean 
}: DownloadSuccessProps) {
  const isSingleFile = files.length <= 1
  const ref = useScrollIntoView<HTMLDivElement>()

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
      <div ref={ref} role="status" className="mt-5 rounded-2xl border-2 border-mint bg-mint/10 p-4">
        <div className="flex items-start gap-3">
          <SuccessBurst />
          <div className="flex-1">
            <p className="text-base font-bold text-mint mb-1">{DOWNLOAD_MESSAGES.SUCCESS.AUDIO_SINGLE}</p>
            <p className="text-sm text-muted-foreground mb-2">
              {fileDownloaded 
                ? DOWNLOAD_MESSAGES.SUCCESS.AUTO_DOWNLOAD
                : DOWNLOAD_MESSAGES.PROCESSING.FINALIZING}
            </p>
            <div className="flex flex-wrap gap-1">
              {quality && (
                <Badge>
                  {describeAudioQuality(quality, format)}
                </Badge>
              )}
              {audioInfo?.metadata?.platform && (
                <Badge>
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
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs bg-background px-3 py-2 rounded-xl border border-surface-border"
                    >
                      <span className="break-words overflow-hidden w-full sm:max-w-[70%] sm:truncate" title={f.name}>{f.name}</span>
                      <div className="flex items-center gap-2 justify-end flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {f.size_bytes ? `${Math.round(f.size_bytes / 1024)} KB` : ''}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadSingleFile(f.name)}
                          aria-label={`Descargar ${f.name}`}
                          className="min-h-11 rounded-full text-mint hover:text-mint"
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

  return (
    <div ref={ref} role="status" className="mt-5 rounded-2xl border-2 border-mint bg-mint/10 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <SuccessBurst />
        <div className="flex-1">
          <p className="text-base font-bold text-mint mb-1">¡Descarga exitosa!</p>
          <p className="text-sm text-muted-foreground mb-2">
            Se produjeron varios archivos. Descarga el ZIP o archivos individuales.
          </p>
          <div className="flex flex-wrap gap-1">
            {quality && (
              <Badge>
                {describeAudioQuality(quality, format)}
              </Badge>
            )}
            {audioInfo?.metadata?.platform && (
              <Badge>
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
