import { Github } from "lucide-react"

export function FeatureBadges() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <div className="px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-full backdrop-blur-sm">
        <p className="text-xs font-bold text-primary">YouTube • Spotify</p>
      </div>
      <div className="px-3 py-1.5 bg-secondary/20 border border-secondary/40 rounded-full backdrop-blur-sm">
        <p className="text-xs font-bold text-secondary">Audio & Video HD</p>
      </div>
      <div className="px-3 py-1.5 bg-accent/20 border border-accent/40 rounded-full backdrop-blur-sm">
        <p className="text-xs font-bold text-accent">100% Seguro</p>
      </div>
      <a 
        href="https://github.com/pabrax/SnapLoad" 
        target="_blank" 
        rel="noopener noreferrer"
        className="px-3 py-1.5 bg-slate-700/40 border border-slate-500/40 rounded-full backdrop-blur-sm hover:bg-slate-600/50 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-1.5">
          <Github className="w-3 h-3 text-slate-300 group-hover:text-white transition-colors" />
          <p className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
            Github
          </p>
        </div>
      </a>
    </div>
  )
}
