"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bookmark, BookmarkCheck, Music2, Trash2 } from "lucide-react"
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
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"

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
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="sm:w-80">
          <label htmlFor="library-search" className="mb-1 block text-sm font-medium text-slate-200">
            Buscar en la biblioteca
          </label>
          <input
            id="library-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Título o artista"
            autoComplete="off"
            className="min-h-11 w-full rounded-md border border-slate-600 bg-slate-900 px-3 text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        {status === "ready" && (
          <p className="text-sm text-slate-300">
            {total} {total === 1 ? "canción" : "canciones"} · conservadas: {formatBytes(keptBytes)}
          </p>
        )}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {notice}
      </p>

      {status === "loading" && (
        <p role="status" className="py-8 text-center text-slate-300">
          Cargando biblioteca…
        </p>
      )}

      {status === "error" && error && (
        <div role="alert" className="rounded-md border border-red-800 bg-red-950 p-4 text-red-100">
          <p>{error.message}</p>
          {error.retryable && (
            <button type="button" onClick={() => void loadFirstPage()} className="mt-3 min-h-11 rounded-md bg-red-800 px-4 font-medium hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Reintentar
            </button>
          )}
        </div>
      )}

      {status === "ready" && items.length === 0 && (
        <div className="py-10 text-center text-slate-300">
          <Music2 aria-hidden="true" className="mx-auto mb-3 size-10 text-slate-400" />
          {searching ? (
            <p>Sin resultados para «{debounced.trim()}».</p>
          ) : (
            <>
              <p>Aún no hay canciones en tu biblioteca.</p>
              <button type="button" onClick={onGoToDownloads} className="mt-4 min-h-11 rounded-full bg-blue-600 px-5 font-semibold text-white hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                Descargar audio
              </button>
            </>
          )}
        </div>
      )}

      {status === "ready" && items.length > 0 && (
        <>
          <ul aria-label="Canciones" className="divide-y divide-slate-800">
            {items.map((track, index) => {
              const row = trackRow(track)
              const isCurrent = player.track?.id === track.id
              return (
                <li key={track.id} className="flex items-center gap-1 py-1">
                  <button
                    type="button"
                    onClick={() => player.playTracks(items, index)}
                    aria-current={isCurrent ? "true" : undefined}
                    className={`flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-md px-2 text-left hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${isCurrent ? "bg-slate-800" : ""}`}
                  >
                    {row.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.coverUrl} alt="" width={40} height={40} loading="lazy" className="size-10 shrink-0 rounded bg-slate-800 object-cover" />
                    ) : (
                      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded bg-slate-800">
                        <Music2 className="size-5 text-slate-400" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      {/* The accessible name is built from the visible text (WCAG 2.5.3): "Reproducir Title Artist 3:35" */}
                      <span className="sr-only">Reproducir </span>
                      <span className={`block truncate text-sm font-semibold ${isCurrent ? "text-blue-300" : "text-slate-100"}`}>{row.title}</span>
                      <span className="block truncate text-xs text-slate-300">{row.artist}</span>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-slate-300">{row.duration}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleKept(track)}
                    aria-pressed={track.kept}
                    aria-label={`Conservar ${row.title}`}
                    title={track.kept ? "Conservada: no se elimina sola" : "Se eliminará con la limpieza automática"}
                    className={`${actionButton} ${track.kept ? "text-blue-400" : ""}`}
                  >
                    {track.kept ? <BookmarkCheck aria-hidden="true" className="size-5" /> : <Bookmark aria-hidden="true" className="size-5" />}
                  </button>
                  <button type="button" onClick={() => setPendingDelete(track)} aria-label={`Eliminar ${row.title}`} className={`${actionButton} hover:text-red-300`}>
                    <Trash2 aria-hidden="true" className="size-5" />
                  </button>
                </li>
              )
            })}
          </ul>

          {items.length < total && (
            <div className="text-center">
              <button type="button" onClick={() => void loadMore()} disabled={loadingMore} className="min-h-11 rounded-full bg-slate-800 px-5 font-medium text-slate-100 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60">
                {loadingMore ? "Cargando…" : "Cargar más"}
              </button>
            </div>
          )}
        </>
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="max-w-md border-slate-700 bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">¿Eliminar esta canción?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
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
