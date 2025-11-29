import { type NextRequest, NextResponse } from "next/server"
import { backendUrl } from "@/src/lib/backend"

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  if (!jobId) return NextResponse.json({ error: "jobId is required" }, { status: 400 })

  try {
    const res = await fetch(backendUrl(`/jobs/${encodeURIComponent(jobId)}`), { method: 'GET' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return NextResponse.json({ error: data.detail || data.error || 'Error fetching status' }, { status: res.status })
    return NextResponse.json(data)
  } catch (e) {
    console.error('[API] Status proxy error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
