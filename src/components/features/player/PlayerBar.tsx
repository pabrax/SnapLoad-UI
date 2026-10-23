"use client"

import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react"
import { formatDuration, trackRow } from "@/src/lib/library-view"
import type { RepeatMode } from "@/src/lib/player-reducer"
import { usePlayer } from "./PlayerProvider"

const REPEAT_LABEL: Record<RepeatMode, string> = {
  off: "Repetir: desactivado",
  all: "Repetir: toda la cola",
  one: "Repetir: una pista",
}

const iconButton =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40"

/** Persistent player: visible while a track is loaded (or a playback error needs attention). */
export function PlayerBar() {
  const player = usePlayer()
  const { state, track, currentTime, duration, volume, muted } = player

  if (!track && !state.error) return null

  const row = track ? trackRow(track) : null
  const RepeatIcon = state.repeat === "one" ? Repeat1 : Repeat
  const elapsedText = formatDuration(currentTime)
  const totalText = formatDuration(duration || track?.duration_s)

  return (
    <>
      {/* Keeps the page content from sitting under the fixed bar */}
      <div aria-hidden="true" className="h-40 sm:h-28" />
      <section
        aria-label="Reproductor de música"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-700 bg-slate-900 px-4 pb-3 pt-2 text-slate-100"
      >
        {state.error && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-md bg-red-950 px-3 py-2 text-sm text-red-100">
            <span>{state.error}</span>
            <button type="button" onClick={player.dismissError} aria-label="Cerrar aviso" className={iconButton}>
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}

        {row && (
          <div className="mx-auto flex max-w-4xl flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 items-center gap-3 sm:w-64 sm:shrink-0">
              {row.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.coverUrl} alt="" width={48} height={48} className="size-12 shrink-0 rounded-md bg-slate-800 object-cover" />
              ) : (
                <div aria-hidden="true" className="size-12 shrink-0 rounded-md bg-slate-800" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{row.title}</p>
                <p className="truncate text-xs text-slate-300">{row.artist}</p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center justify-center gap-1">
                <button type="button" onClick={player.toggleShuffle} aria-label="Orden aleatorio" aria-pressed={state.shuffle} className={`${iconButton} ${state.shuffle ? "text-blue-400" : ""}`}>
                  <Shuffle aria-hidden="true" className="size-4" />
                </button>
                <button type="button" onClick={player.prev} aria-label="Pista anterior" className={iconButton}>
                  <SkipBack aria-hidden="true" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={player.toggle}
                  aria-label={state.playing ? "Pausar" : "Reproducir"}
                  className="inline-flex size-11 items-center justify-center rounded-full bg-white text-slate-900 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {state.playing ? <Pause aria-hidden="true" className="size-5" /> : <Play aria-hidden="true" className="size-5" />}
                </button>
                <button type="button" onClick={player.next} aria-label="Pista siguiente" className={iconButton}>
                  <SkipForward aria-hidden="true" className="size-5" />
                </button>
                <button type="button" onClick={player.cycleRepeat} aria-label={REPEAT_LABEL[state.repeat]} className={`${iconButton} ${state.repeat !== "off" ? "text-blue-400" : ""}`}>
                  <RepeatIcon aria-hidden="true" className="size-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs tabular-nums text-slate-300">
                <span aria-hidden="true" className="w-12 text-right">{elapsedText}</span>
                <input
                  type="range"
                  aria-label="Posición de reproducción"
                  aria-valuetext={`${elapsedText} de ${totalText}`}
                  min={0}
                  max={Math.max(duration, 1)}
                  step={1}
                  value={Math.min(currentTime, Math.max(duration, 1))}
                  onChange={(e) => player.seek(Number(e.target.value))}
                  className="h-11 min-w-0 flex-1 cursor-pointer accent-blue-500"
                />
                <span aria-hidden="true" className="w-12">{totalText}</span>
              </div>
            </div>

            <div className="hidden items-center gap-1 sm:flex sm:w-40 sm:shrink-0">
              <button type="button" onClick={player.toggleMute} aria-label={muted ? "Activar sonido" : "Silenciar"} aria-pressed={muted} className={iconButton}>
                {muted || volume === 0 ? <VolumeX aria-hidden="true" className="size-4" /> : <Volume2 aria-hidden="true" className="size-4" />}
              </button>
              <input
                type="range"
                aria-label="Volumen"
                aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)} %`}
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => player.setVolume(Number(e.target.value))}
                className="h-11 min-w-0 flex-1 cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        )}
      </section>
    </>
  )
}
