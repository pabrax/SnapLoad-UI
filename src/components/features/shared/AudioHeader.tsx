import { Disc3, Waves, Music } from "lucide-react"

export function AudioHeader() {
  return (
    <header className="mb-8 text-center">
      <div aria-hidden="true" className="mb-4 inline-flex items-center gap-3">
        <Disc3 className="h-10 w-10 text-blue-400" strokeWidth={2} />
        <Waves className="h-10 w-10 text-purple-400" strokeWidth={2} />
        <Music className="h-10 w-10 text-teal-400" strokeWidth={2} />
      </div>
      <h1 className="mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-5xl font-black leading-tight text-transparent md:text-7xl">
        SnapLoad
      </h1>
      <p className="mb-4 text-base font-medium text-slate-300 md:text-lg">
        Descarga música y videos de YouTube y Spotify al instante
      </p>
    </header>
  )
}
