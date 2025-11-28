import { Music } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import type { AudioInfoResponse } from "@/src/types/api"

interface AudioInfoPreviewProps {
  audioInfo: AudioInfoResponse | null
}

export function AudioInfoPreview({ audioInfo }: AudioInfoPreviewProps) {
  if (!audioInfo || !audioInfo.success || !audioInfo.metadata) {
    return null
  }

  return (
    <div className="p-3 bg-muted/30 border border-muted rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Music className="w-4 h-4 text-primary" />
        <span className="font-semibold text-xs uppercase tracking-wide">Vista Previa</span>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-sm">{audioInfo.metadata.title}</p>
        {audioInfo.metadata.artist && (
          <p className="text-muted-foreground text-sm">{audioInfo.metadata.artist}</p>
        )}
        <div className="flex gap-2">
          {audioInfo.metadata.platform && (
            <Badge variant="secondary" className="text-xs">
              {audioInfo.metadata.platform}
            </Badge>
          )}
          {audioInfo.metadata.duration && (
            <Badge variant="outline" className="text-xs">
              {Math.floor(audioInfo.metadata.duration / 60)}:
              {(audioInfo.metadata.duration % 60).toString().padStart(2, '0')}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
