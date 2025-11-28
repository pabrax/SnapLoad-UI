"use client"

import React from "react"
import VideoDownloader from "@/src/components/features/video-downloader"
import { Card } from "@/src/components/ui/card"

export default function VideoPage() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative z-10 w-full max-w-4xl px-4 md:px-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent leading-tight">Videos</h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium mb-4">Descarga videos desde YouTube (elige formato)</p>
        </div>

        <VideoDownloader />
      </div>
    </main>
  )
}
