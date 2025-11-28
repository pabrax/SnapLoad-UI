import { type NextRequest, NextResponse } from "next/server"
import { backendUrl } from "@/src/lib/backend"

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  if (!jobId) return NextResponse.json({ error: "jobId is required" }, { status: 400 })

  try {
    const res = await fetch(backendUrl(`/files/${encodeURIComponent(jobId)}/archive`))
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json({ error: data.detail || data.error || 'Error creating archive' }, { status: res.status })
    }

    const arrayBuffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'application/zip'
    const filename = `${jobId}.zip`

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      }
    })
  } catch (e) {
    console.error('[API] Archive proxy error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
