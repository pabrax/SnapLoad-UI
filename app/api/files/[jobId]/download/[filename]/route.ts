import { type NextRequest, NextResponse } from "next/server"
import { backendUrl } from "@/src/lib/backend"

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string, filename: string }> }) {
  const { jobId, filename } = await params
  if (!jobId || !filename) return NextResponse.json({ error: "jobId and filename are required" }, { status: 400 })

  try {
    const res = await fetch(backendUrl(`/files/${encodeURIComponent(jobId)}/download/${encodeURIComponent(filename)}`))
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json({ error: data.detail || data.error || 'Error downloading file' }, { status: res.status })
    }

    // Stream the response back to the client
    const arrayBuffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      }
    })
  } catch (e) {
    console.error('[API] File download proxy error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
