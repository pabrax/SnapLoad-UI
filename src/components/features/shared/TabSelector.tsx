"use client"

import { useRef, type KeyboardEvent } from "react"
import type { TabType } from "@/src/types/api"
import { nextTabIndex } from "@/src/lib/tab-keyboard"

interface TabSelectorProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const TABS: ReadonlyArray<{ id: TabType; label: string }> = [
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
  { id: "library", label: "Biblioteca" },
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

  const activeIndex = Math.max(
    0,
    TABS.findIndex((tab) => tab.id === activeTab),
  )

  return (
    <div
      role="tablist"
      aria-label="Tipo de descarga"
      className="relative mx-auto mb-5 grid w-full max-w-md grid-cols-3 rounded-full border border-surface-border bg-card p-1.5"
    >
      {/* Sliding pill: moves one segment per tab and takes the mode color (decorative, tabs keep their own state) */}
      <span
        aria-hidden="true"
        className="tab-indicator pointer-events-none absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/3)] rounded-full bg-mode"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
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
            className={`relative z-10 min-h-11 rounded-full px-2 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:text-base ${
              selected ? "text-mode-ink" : "text-foreground hover:text-mode"
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
