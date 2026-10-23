import { type NextRequest, NextResponse } from "next/server"
import { backendUrl } from "@/src/lib/backend"

export const dynamic = "force-dynamic"

// Only these query parameters are forwarded to the backend.
const QUERY_PARAMS = ["limit", "offset", "q"]

export async function GET(request: NextRequest) {
  const query = new URLSearchParams()
  for (const name of QUERY_PARAMS) {
    const value = request.nextUrl.searchParams.get(name)
    if (value !== null) query.set(name, value)
  }

  try {
    const suffix = query.size ? `?${query}` : ""
    const res = await fetch(backendUrl(`/library/tracks${suffix}`), { cache: "no-store" })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return NextResponse.json({ error: data.detail || data.error || "Error listing library" }, { status: res.status })
    return NextResponse.json(data)
  } catch (e) {
    console.error("[API] Library list proxy error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
