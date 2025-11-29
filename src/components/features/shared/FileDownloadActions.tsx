import { Button } from "@/src/components/ui/button"
import { downloadFile, downloadZip, downloadAllFiles } from "@/src/lib/utils/download-helpers"
import type { ProducedFile } from "@/src/types/api"

interface FileDownloadActionsProps {
  jobId: string | null
  files: ProducedFile[]
  showIndividual?: boolean
  onClean?: () => void
}

export function FileDownloadActions({ 
  jobId, 
  files, 
  showIndividual = false,
  onClean 
}: FileDownloadActionsProps) {
  if (!jobId) return null

  const handleDownloadFile = async (filename: string) => {
    try {
      await downloadFile(jobId, filename)
    } catch (e) {
      console.error('Error downloading file:', e)
    }
  }

  const handleDownloadZip = async () => {
    try {
      await downloadZip(jobId)
    } catch (e) {
      console.error('Error downloading ZIP:', e)
    }
  }

  const handleDownloadAll = async () => {
    try {
      await downloadAllFiles(jobId, files)
    } catch (e) {
      console.error('Error downloading all files:', e)
    }
  }

  return (
    <div className="space-y-2">
      {showIndividual && files.length > 0 && (
        <>
          <p className="text-xs font-semibold text-primary/80 uppercase tracking-wide">Archivos</p>
          <ul className="space-y-1">
            {files.filter(f => f && f.name).map((file, idx) => (
              <li 
                key={`${file.name}-${idx}`} 
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs bg-primary/5 px-3 py-2 rounded-lg border border-primary/10"
              >
                <span className="break-words overflow-hidden w-full sm:max-w-[60%] sm:truncate" title={file.name}>
                  {file.name}
                </span>
                <div className="flex items-center gap-2 justify-end flex-shrink-0">
                  <span className="text-[10px] opacity-70">
                    {file.size_bytes ? `${Math.round(file.size_bytes / 1024)} KB` : ""}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownloadFile(file.name)}
                  >
                    Descargar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDownloadZip}
        >
          Descargar ZIP
        </Button>
        
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDownloadAll}
        >
          Descargar todo
        </Button>
        
        {onClean && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClean}
          >
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}
