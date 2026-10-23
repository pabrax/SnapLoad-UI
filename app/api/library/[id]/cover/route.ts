import { type NextRequest, NextResponse } from "next/server"
import { backendUrl } from "@/src/lib/backend"
import { isTrackId } from "@/src/lib/range-proxy"

export const dynamic = "force-dynamic"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isTrackId(id)) return NextResponse.json({ error: "Track not found" }, { status: 404 })

  try {
    const res = await fetch(backendUrl(`/library/tracks/${id}/cover`), { cache: "no-store" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json({ error: data.detail || data.error || "No cover" }, { status: res.status })
    }
    return new NextResponse(res.body, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "private, max-age=86400",
      },
    })
  } catch (e) {
    console.error("[API] Library cover proxy error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
