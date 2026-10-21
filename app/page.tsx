"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/src/components/ui/card"
import { AudioHeader } from "@/src/components/features/shared/AudioHeader"
import { TabSelector } from "@/src/components/features/shared/TabSelector"
import { FeatureBadges } from "@/src/components/features/shared/FeatureBadges"
import { BackgroundEffects } from "@/src/components/features/shared/BackgroundEffects"
import { Footer } from "@/src/components/features/shared/LegalDisclaimer"
import AudioDownloadForm from "@/src/components/features/audio/AudioDownloadForm"
import { useBackendHealth } from "@/src/hooks/use-backend-health"
import type { TabType } from "@/src/types/api"

// Se cargan bajo demanda: el diálogo solo si el backend cae y el formulario de video solo en su pestaña.
const BackendDisconnectedDialog = dynamic(
  () => import("@/src/components/features/shared/BackendDisconnectedDialog").then((m) => m.BackendDisconnectedDialog),
  { ssr: false },
)
const VideoDownloader = dynamic(() => import("@/src/components/features/video-downloader"))

export default function MusicDownloader() {
  const [tab, setTab] = useState<TabType>('audio')
  const [dialogDismissed, setDialogDismissed] = useState(false)
  const { backendStatus } = useBackendHealth()

  const isDialogOpen = backendStatus === 'disconnected' && !dialogDismissed

  return (
    <main id="contenido" tabIndex={-1} className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <BackgroundEffects />

      {isDialogOpen && (
        <BackendDisconnectedDialog open onOpenChange={() => setDialogDismissed(true)} />
      )}

      <div className="relative z-10 w-full max-w-4xl px-4 md:px-6">
        <AudioHeader />

        <TabSelector activeTab={tab} onTabChange={setTab} />

        <Card className="relative p-6 md:p-8 bg-surface border border-surface-border shadow-xl shadow-black/30">
          {tab === 'audio' ? (
            <AudioDownloadForm backendStatus={backendStatus} />
          ) : (
            <div className="relative">
              <VideoDownloader noCard backendStatus={backendStatus} />
            </div>
          )}
        </Card>

        <FeatureBadges backendStatus={backendStatus} />
        <Footer />
      </div>
    </main>
  )
}
