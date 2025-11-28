import type { TabType } from "@/src/types/api"

interface TabSelectorProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onTabChange('audio')}
        className={`px-4 py-2 rounded-full font-semibold ${
          activeTab === 'audio' 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-slate-800 text-muted-foreground'
        }`}
      >
        Audio
      </button>
      <button
        type="button"
        onClick={() => onTabChange('video')}
        className={`px-4 py-2 rounded-full font-semibold ${
          activeTab === 'video' 
            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
            : 'bg-slate-800 text-muted-foreground'
        }`}
      >
        Video
      </button>
    </div>
  )
}
