"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AudioLines, Bookmark, BookmarkCheck, Music2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"
import { listTracks, removeTrack, setKept } from "@/src/lib/library-client"
import { formatBytes, trackRow } from "@/src/lib/library-view"
import type { LibraryTrack } from "@/src/types/api"
import { usePlayer } from "@/src/components/features/player/PlayerProvider"

const PAGE_SIZE = 50
const SEARCH_DEBOUNCE_MS = 300

type Status = "loading" | "ready" | "error"

interface LibraryPanelProps {
  // Sends the user to the audio download tab (shown in the empty state)
  onGoToDownloads: () => void
}

const actionButton =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-plum-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"

// Covers without art get a colored tile; the color is derived from the id so it stays stable between renders.
const TILE_COLORS = ["bg-coral", "bg-violet", "bg-sun", "bg-mint"]
const tileColor = (id: string) => TILE_COLORS[[...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TILE_COLORS.length]

/** Cassette drawn inline (no asset to load); colors come from tokens. */
function EmptyCassette() {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 110" className="mx-auto mb-4 h-28 w-40">
      <rect x="6" y="10" width="148" height="90" rx="14" className="fill-plum-raised stroke-cassette" strokeWidth="3" />
      <rect x="22" y="22" width="116" height="38" rx="8" className="fill-cassette" />
      <rect x="30" y="30" width="60" height="6" rx="3" className="fill-coral" />
      <rect x="30" y="42" width="42" height="6" rx="3" className="fill-sun" />
      <circle cx="52" cy="78" r="12" className="fill-plum stroke-cassette" strokeWidth="3" />
      <circle cx="108" cy="78" r="12" className="fill-plum stroke-cassette" strokeWidth="3" />
      <circle cx="52" cy="78" r="4" className="fill-mint" />
      <circle cx="108" cy="78" r="4" className="fill-mint" />
      <rect x="66" y="70" width="28" height="16" rx="4" className="fill-plum stroke-cassette" strokeWidth="2" />
    </svg>
  )
}

export default function LibraryPanel({ onGoToDownloads }: LibraryPanelProps) {
  const player = usePlayer()
  const [items, setItems] = useState<LibraryTrack[]>([])
  const [total, setTotal] = useState(0)
  const [keptBytes, setKeptBytes] = useState(0)
  const [status, setStatus] = useState<Status>("loading")
  const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null)
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [loadingMore, setLoadingMore] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<LibraryTrack | null>(null)
  const [notice, setNotice] = useState("")
  const latestRequest = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  const loadFirstPage = useCallback(async () => {
    const request = ++latestRequest.current
    setStatus("loading")
    const result = await listTracks({ limit: PAGE_SIZE, offset: 0, q: debounced })
    if (request !== latestRequest.current) return // a newer search superseded this one
    if (!result.ok) {
      setError({ message: result.error, retryable: result.retryable })
      setStatus("error")
      return
    }
    setItems(result.data.tracks)
    setTotal(result.data.total)
    setKeptBytes(result.data.kept_bytes)
    setError(null)
    setStatus("ready")
  }, [debounced])

  useEffect(() => {
    void loadFirstPage()
  }, [loadFirstPage])

  const loadMore = async () => {
    const request = ++latestRequest.current
    setLoadingMore(true)
    const result = await listTracks({ limit: PAGE_SIZE, offset: items.length, q: debounced })
    if (request !== latestRequest.current) return
    setLoadingMore(false)
    if (!result.ok) {
      setNotice(`No se pudieron cargar más canciones: ${result.error}`)
      return
    }
    setItems((current) => [...current, ...result.data.tracks])
    setTotal(result.data.total)
    setKeptBytes(result.data.kept_bytes)
  }

  const toggleKept = async (track: LibraryTrack) => {
    const result = await setKept(track.id, !track.kept)
    if (!result.ok) {
      setNotice(`No se pudo actualizar «${track.title ?? "Sin título"}»: ${result.error}`)
      return
    }
    setItems((current) => current.map((t) => (t.id === track.id ? { ...t, kept: result.data.kept } : t)))
    setKeptBytes((bytes) => bytes + (result.data.kept ? track.size_bytes : -track.size_bytes))
    setNotice(result.data.kept ? "Canción conservada" : "La canción se eliminará con la limpieza automática")
  }

  const confirmDelete = async () => {
    const track = pendingDelete
    setPendingDelete(null)
    if (!track) return
    const result = await removeTrack(track.id)
    if (!result.ok) {
      setNotice(`No se pudo eliminar «${track.title ?? "Sin título"}»: ${result.error}`)
      return
    }
    player.removeTrack(track.id)
    setItems((current) => current.filter((t) => t.id !== track.id))
    setTotal((count) => Math.max(count - 1, 0))
    if (track.kept) setKeptBytes((bytes) => Math.max(bytes - track.size_bytes, 0))
    setNotice(`Eliminada «${track.title ?? "Sin título"}»`)
  }

  const searching = debounced.trim() !== ""

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="sm:w-80">
          <label htmlFor="library-search" className="mb-1.5 block text-base font-bold text-foreground">
            Buscar en la biblioteca
          </label>
          <input
            id="library-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Título o artista"
            autoComplete="off"
            className="min-h-12 w-full rounded-2xl border-2 border-mode bg-background px-4 text-foreground shadow-[3px_3px_0_var(--mode)] placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          />
        </div>
        {status === "ready" && (
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "canción" : "canciones"} · conservadas: {formatBytes(keptBytes)}
          </p>
        )}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {notice}
      </p>

      {status === "loading" && (
        <div>
          <p role="status" className="py-2 text-center text-muted-foreground">
            Cargando biblioteca…
          </p>
          <div aria-hidden="true" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="shimmer aspect-square rounded-2xl bg-plum-raised" />
            ))}
          </div>
        </div>
      )}

      {status === "error" && error && (
        <div role="alert" className="shake-once rounded-2xl border-2 border-dashed border-tomato bg-tomato/10 p-4 text-foreground">
          <p>{error.message}</p>
          {error.retryable && (
            <button type="button" onClick={() => void loadFirstPage()} className="mt-3 min-h-11 rounded-full bg-tomato px-5 font-bold text-plum hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Reintentar
            </button>
          )}
        </div>
      )}

      {status === "ready" && items.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          <EmptyCassette />
          {searching ? (
            <p>Sin resultados para «{debounced.trim()}».</p>
          ) : (
            <>
              <p className="text-base text-foreground">Aún no hay canciones en tu biblioteca.</p>
              <button type="button" onClick={onGoToDownloads} className="mt-5 min-h-11 rounded-full bg-coral px-6 font-bold text-plum shadow-[3px_3px_0_var(--cassette)] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                Descargar audio
              </button>
            </>
          )}
        </div>
      )}

      {status === "ready" && items.length > 0 && (
        <>
          <ul aria-label="Canciones" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((track, index) => {
              const row = trackRow(track)
              const isCurrent = player.track?.id === track.id
              return (
                <li key={track.id} className={`lift flex flex-col rounded-2xl border-2 bg-card ${isCurrent ? "border-sun shadow-[4px_4px_0_var(--sun)]" : "border-surface-border"}`}>
                  <button
                    type="button"
                    onClick={() => player.playTracks(items, index)}
                    aria-current={isCurrent ? "true" : undefined}
                    className="relative block min-w-0 rounded-2xl p-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="relative mb-2 block aspect-square overflow-hidden rounded-xl border-2 border-plum">
                      {row.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.coverUrl} alt="" width={200} height={200} loading="lazy" className="size-full bg-plum-raised object-cover" />
                      ) : (
                        <span aria-hidden="true" className={`flex size-full items-center justify-center ${tileColor(track.id)}`}>
                          <Music2 className="size-1/3 text-plum" />
                        </span>
                      )}
                      {isCurrent && (
                        <span aria-hidden="true" className="absolute left-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-sun text-plum">
                          <AudioLines className="size-4" />
                        </span>
                      )}
                    </span>
                    {/* The accessible name is built from the visible text (WCAG 2.5.3): "Reproducir Title Artist 3:35" */}
                    <span className="sr-only">Reproducir </span>
                    <span className={`line-clamp-2 break-words px-1 text-sm font-bold leading-snug ${isCurrent ? "text-sun" : "text-foreground"}`}>{row.title}</span>
                    <span className="block truncate px-1 text-xs text-muted-foreground">{row.artist}</span>
                    <span className="absolute right-3.5 top-3.5 rounded-full bg-plum/85 px-2 py-0.5 text-xs font-semibold tabular-nums text-cassette">{row.duration}</span>
                  </button>
                  <div className="mt-auto flex justify-end gap-0.5 px-1.5 pb-1.5">
                    <button
                      type="button"
                      onClick={() => void toggleKept(track)}
                      aria-pressed={track.kept}
                      aria-label={`Conservar ${row.title}`}
                      title={track.kept ? "Conservada: no se elimina sola" : "Se eliminará con la limpieza automática"}
                      className={`${actionButton} ${track.kept ? "text-sun" : ""}`}
                    >
                      {track.kept ? <BookmarkCheck aria-hidden="true" className="size-5" /> : <Bookmark aria-hidden="true" className="size-5" />}
                    </button>
                    <button type="button" onClick={() => setPendingDelete(track)} aria-label={`Eliminar ${row.title}`} className={`${actionButton} hover:text-tomato`}>
                      <Trash2 aria-hidden="true" className="size-5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          {items.length < total && (
            <div className="text-center">
              <button type="button" onClick={() => void loadMore()} disabled={loadingMore} className="min-h-11 rounded-full border-2 border-mode px-6 font-bold text-mode hover:bg-mode hover:text-mode-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60">
                {loadingMore ? "Cargando…" : "Cargar más"}
              </button>
            </div>
          )}
        </>
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="max-w-md border-surface-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-foreground">¿Eliminar esta canción?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              «{pendingDelete?.title ?? "Sin título"}» se borrará del servidor y no se puede recuperar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
