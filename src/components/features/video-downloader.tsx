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
    <Card className="relative p-6 md:p-8 bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700/50 shadow-2xl shadow-slate-950/50">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-teal-500/10 blur-xl" />
      <div className="relative z-10">{inner}</div>
    </Card>
  )
}

