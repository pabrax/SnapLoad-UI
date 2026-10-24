"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/src/components/ui/card"
import { AudioHeader } from "@/src/components/features/shared/AudioHeader"
import { TabSelector, tabId, panelId } from "@/src/components/features/shared/TabSelector"
import { FeatureBadges } from "@/src/components/features/shared/FeatureBadges"
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
const LibraryPanel = dynamic(() => import("@/src/components/features/library/LibraryPanel"))

export default function MusicDownloader() {
  const [tab, setTab] = useState<TabType>('audio')
  const [dialogDismissed, setDialogDismissed] = useState(false)
  const { backendStatus } = useBackendHealth()

  // Si el servidor vuelve, un futuro corte debe volver a avisar
  useEffect(() => {
    if (backendStatus === 'connected') setDialogDismissed(false)
  }, [backendStatus])

  const isDialogOpen = backendStatus === 'disconnected' && !dialogDismissed

  return (
    <main id="contenido" tabIndex={-1} data-mode={tab} className="backdrop relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 md:p-8">
      {isDialogOpen && (
        <BackendDisconnectedDialog open onOpenChange={() => setDialogDismissed(true)} />
      )}

      <div className="relative z-10 w-full max-w-4xl px-4 md:px-6">
        <AudioHeader />

        <TabSelector activeTab={tab} onTabChange={setTab} />

        <Card className="relative rounded-3xl border-2 border-surface-border bg-card p-5 sm:p-6 md:p-8">
          <div role="tabpanel" id={panelId(tab)} aria-labelledby={tabId(tab)} className="relative">
            {tab === 'audio' && <AudioDownloadForm backendStatus={backendStatus} />}
            {tab === 'video' && <VideoDownloader noCard backendStatus={backendStatus} />}
            {tab === 'library' && <LibraryPanel onGoToDownloads={() => setTab('audio')} />}
          </div>
        </Card>

        <FeatureBadges backendStatus={backendStatus} />
        <Footer />
      </div>
    </main>
  )
}
