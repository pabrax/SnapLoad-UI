"use client"

import React from "react"
import Link from "next/link"
import VideoDownloader from "@/src/components/features/video-downloader"
import { useBackendHealth } from "@/src/hooks/use-backend-health"

export default function VideoPage() {
  // Without the real status the download button stayed disabled for good ("unknown" is not "connected").
  const { backendStatus } = useBackendHealth()

  return (
    <main id="contenido" tabIndex={-1} data-mode="video" className="backdrop relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 md:p-8">
      <div className="relative z-10 w-full max-w-4xl px-4 md:px-6">
        <nav aria-label="Navegación" className="mb-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-mode hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span aria-hidden="true">←&nbsp;</span>Volver al inicio
          </Link>
        </nav>

        <header className="text-center mb-8">
          <h1 className="mb-3 font-display text-4xl leading-none tracking-tight text-mode md:text-6xl">Videos</h1>
          <p className="text-base font-medium text-muted-foreground md:text-lg">Descarga videos desde YouTube (elige formato y resolución)</p>
        </header>

        <VideoDownloader backendStatus={backendStatus} />
      </div>
    </main>
  )
}
