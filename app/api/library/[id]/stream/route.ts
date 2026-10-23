import { type NextRequest, NextResponse } from "next/server"
import { backendUrl } from "@/src/lib/backend"
import { downstreamHeaders, isTrackId, upstreamHeaders } from "@/src/lib/range-proxy"

export const dynamic = "force-dynamic"

// Streams a track with HTTP Range pass-through so the <audio> element can seek.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isTrackId(id)) return NextResponse.json({ error: "Track not found" }, { status: 404 })

  try {
    // The abort signal frees the backend stream when the browser drops the connection (seek, next track).
    const res = await fetch(backendUrl(`/library/tracks/${id}/stream`), {
      headers: upstreamHeaders(request.headers),
      signal: request.signal,
      cache: "no-store",
    })

    if (res.status === 200 || res.status === 206 || res.status === 416) {
      return new NextResponse(res.status === 416 ? null : res.body, { status: res.status, headers: downstreamHeaders(res.headers) })
    }
    const data = await res.json().catch(() => ({}))
    return NextResponse.json({ error: data.detail || data.error || "Error streaming track" }, { status: res.status })
  } catch (e) {
    if (request.signal.aborted) return new NextResponse(null, { status: 499 })
    console.error("[API] Library stream proxy error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
