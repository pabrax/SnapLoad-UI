"use client"

import { useRef, type KeyboardEvent } from "react"
import type { TabType } from "@/src/types/api"
import { nextTabIndex } from "@/src/lib/tab-keyboard"

interface TabSelectorProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const TABS: ReadonlyArray<{ id: TabType; label: string; active: string }> = [
  { id: "audio", label: "Audio", active: "bg-gradient-to-r from-blue-600 to-purple-600 text-white" },
  { id: "video", label: "Video", active: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white" },
  { id: "library", label: "Biblioteca", active: "bg-gradient-to-r from-purple-600 to-pink-600 text-white" },
]

export function tabId(tab: TabType) {
  return `tab-${tab}`
}

export function panelId(tab: TabType) {
  return `panel-${tab}`
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextTabIndex(event.key, index, TABS.length)
    if (next === null) return
    event.preventDefault()
    onTabChange(TABS[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label="Tipo de descarga" className="mb-4 flex items-center justify-center gap-2 sm:gap-3">
      {TABS.map((tab, index) => {
        const selected = tab.id === activeTab
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="tab"
            id={tabId(tab.id)}
            aria-selected={selected}
            aria-controls={panelId(tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`min-h-11 min-w-24 rounded-full px-4 py-2 font-semibold sm:px-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              selected ? tab.active : "bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
