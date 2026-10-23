/**
 * Browser-side client of the library proxy routes (app/api/library/**). The fetch implementation is
 * injectable so it can be unit tested with `node --test`.
 */
import type { LibraryListResponse, LibraryTrack } from "@/src/types/api"

export type ClientResult<T> = { ok: true; data: T } | { ok: false; error: string; retryable: boolean }

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export interface ListParams {
  limit?: number
  offset?: number
  q?: string
}

const OFFLINE_MESSAGE = "No se pudo conectar con el servidor"

export const streamUrl = (id: string) => `/api/library/${id}/stream`
export const coverUrl = (id: string) => `/api/library/${id}/cover`

async function failure(res: Response): Promise<ClientResult<never>> {
  const body = await res.json().catch(() => ({}))
  return {
    ok: false,
    error: body.error || body.detail || `Error ${res.status}`,
    // 5xx and gateway problems may pass on their own; a 4xx will not
    retryable: res.status >= 500,
  }
}

async function request<T>(fetchImpl: FetchLike, url: string, init: RequestInit | undefined, parse: (res: Response) => Promise<T>): Promise<ClientResult<T>> {
  try {
    const res = await fetchImpl(url, init)
    if (!res.ok) return await failure(res)
    return { ok: true, data: await parse(res) }
  } catch {
    return { ok: false, error: OFFLINE_MESSAGE, retryable: true }
  }
}

export function listTracks(params: ListParams = {}, fetchImpl: FetchLike = fetch): Promise<ClientResult<LibraryListResponse>> {
  const query = new URLSearchParams()
  if (params.limit !== undefined) query.set("limit", String(params.limit))
  if (params.offset !== undefined) query.set("offset", String(params.offset))
  if (params.q && params.q.trim()) query.set("q", params.q.trim())
  const suffix = query.toString()
  return request(fetchImpl, `/api/library${suffix ? `?${suffix}` : ""}`, undefined, (res) => res.json())
}

export function setKept(id: string, kept: boolean, fetchImpl: FetchLike = fetch): Promise<ClientResult<LibraryTrack>> {
  return request(
    fetchImpl,
    `/api/library/${id}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kept }) },
    (res) => res.json(),
  )
}

export function removeTrack(id: string, fetchImpl: FetchLike = fetch): Promise<ClientResult<null>> {
  return request(fetchImpl, `/api/library/${id}`, { method: "DELETE" }, async () => null)
}
