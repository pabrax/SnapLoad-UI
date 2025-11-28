"use client"

import { useState } from "react"
import { Card } from "@/src/components/ui/card"
import { AudioHeader } from "@/src/components/features/shared/AudioHeader"
import { TabSelector } from "@/src/components/features/shared/TabSelector"
import { FeatureBadges } from "@/src/components/features/shared/FeatureBadges"
import { BackgroundEffects } from "@/src/components/features/shared/BackgroundEffects"
import AudioDownloadForm from "@/src/components/features/audio/AudioDownloadForm"
import VideoDownloader from "@/src/components/features/video-downloader"
import { useBackendHealth } from "@/src/hooks/use-backend-health"
import type { TabType } from "@/src/types/api"

export default function MusicDownloader() {
  const [tab, setTab] = useState<TabType>('audio')
  const { backendStatus } = useBackendHealth()

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <BackgroundEffects />

      <div className="relative z-10 w-full max-w-4xl px-4 md:px-6">
        <AudioHeader />

        <TabSelector activeTab={tab} onTabChange={setTab} />

        <Card className="relative p-6 md:p-8 bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700/50 shadow-2xl shadow-slate-950/50">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-teal-500/10 blur-xl" />
          {tab === 'audio' ? (
            <AudioDownloadForm backendStatus={backendStatus} />
          ) : (
            <div className="relative">
              <VideoDownloader noCard backendStatus={backendStatus} />
            </div>
          )}
        </Card>

        <FeatureBadges backendStatus={backendStatus} />
      </div>
    </main>
  )
}
