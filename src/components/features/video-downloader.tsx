"use client"

import React from "react"
import { Card } from "@/src/components/ui/card"
import VideoDownloadForm from "@/src/components/features/video/VideoDownloadForm"
import type { BackendStatus } from "@/src/types/api"

interface VideoDownloaderProps {
  noCard?: boolean
  backendStatus?: BackendStatus
}

export default function VideoDownloader({ 
  noCard = false, 
  backendStatus = "unknown" 
}: VideoDownloaderProps) {
  const inner = <VideoDownloadForm backendStatus={backendStatus} />

  if (noCard) {
    return inner
  }

  return (
    <Card className="relative p-6 md:p-8 bg-surface border border-surface-border shadow-xl shadow-black/30">
      <div className="relative z-10">{inner}</div>
    </Card>
  )
}

