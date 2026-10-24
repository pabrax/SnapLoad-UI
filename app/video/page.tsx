"use client"

import React from "react"
import Link from "next/link"
import VideoDownloader from "@/src/components/features/video-downloader"
import { Card } from "@/src/components/ui/card"

export default function VideoPage() {
  return (
    <main id="contenido" tabIndex={-1} data-mode="video" className="backdrop relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 md:p-8">
      <div className="relative z-10 w-full max-w-4xl px-4 md:px-6">
        <nav aria-label="Navegación" className="mb-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold text-slate-300 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span aria-hidden="true">←&nbsp;</span>Volver al inicio
          </Link>
        </nav>

        <header className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent leading-tight">Videos</h1>
          <p className="text-base md:text-lg text-slate-300 font-medium mb-4">Descarga videos desde YouTube (elige formato y resolución)</p>
        </header>

        <VideoDownloader />
      </div>
    </main>
  )
}
