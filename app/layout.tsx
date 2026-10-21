import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/src/components/ui/toaster'
import '../src/styles/globals.css'

export const metadata: Metadata = {
  title: 'SnapLoad: descarga audio y video de YouTube y Spotify',
  description:
    'Descarga música y videos de YouTube y Spotify en MP3, M4A, Opus, FLAC, WEBM, MP4 y más, con la calidad que elijas.',
  generator: 'SnapLoad',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020617',
  colorScheme: 'dark',
}

// La telemetría de terceros es opt-in: la app se autoaloja y solo Vercel sirve /_vercel/insights.
const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Saltar al contenido
        </a>
        {children}
        <Toaster />
        {analyticsEnabled && <Analytics />}
      </body>
    </html>
  )
}
