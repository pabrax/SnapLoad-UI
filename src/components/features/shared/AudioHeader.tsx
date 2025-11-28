import { Disc3, Waves, Music } from "lucide-react"

export function AudioHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-3 mb-4 float-animation">
        <Disc3 className="w-10 h-10 text-blue-400" strokeWidth={2} />
        <Waves className="w-10 h-10 text-purple-400" strokeWidth={2} />
        <Music className="w-10 h-10 text-teal-400" strokeWidth={2} />
      </div>
      <h1 className="text-5xl md:text-7xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent leading-tight">
        SnapLoad
      </h1>
      <p className="text-base md:text-lg text-muted-foreground font-medium mb-4">
        Descarga música y videos de YouTube y Spotify al instante
      </p>
    </div>
  )
}
