import { type NextRequest, NextResponse } from "next/server"
import { backendUrl } from "@/src/lib/backend"
import { isTrackId } from "@/src/lib/range-proxy"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

async function validId(params: Params["params"]): Promise<string | null> {
  const { id } = await params
  return isTrackId(id) ? id : null
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = await validId(params)
  if (!id) return NextResponse.json({ error: "Track not found" }, { status: 404 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body.kept !== "boolean") return NextResponse.json({ error: "kept must be a boolean" }, { status: 422 })

  try {
    const res = await fetch(backendUrl(`/library/tracks/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kept: body.kept }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return NextResponse.json({ error: data.detail || data.error || "Error updating track" }, { status: res.status })
    return NextResponse.json(data)
  } catch (e) {
    console.error("[API] Library update proxy error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const id = await validId(params)
  if (!id) return NextResponse.json({ error: "Track not found" }, { status: 404 })

  try {
    const res = await fetch(backendUrl(`/library/tracks/${id}`), { method: "DELETE" })
    if (res.status === 204) return new NextResponse(null, { status: 204 })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json({ error: data.detail || data.error || "Error deleting track" }, { status: res.status })
  } catch (e) {
    console.error("[API] Library delete proxy error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
