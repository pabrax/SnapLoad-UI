import { type NextRequest, NextResponse } from "next/server"
import { backendUrl } from "@/src/lib/backend"

function asciiFallback(name: string): string {
  // Remove diacritics and replace non-ASCII with '-'
  const nkfd = name.normalize('NFKD')
  let out = ''
  for (const ch of nkfd) {
    const code = ch.charCodeAt(0)
    if (code < 128) {
      // filter control chars
      if (code >= 32 && code < 127) out += ch
      continue
    }
    // skip combining marks
    const cat = (/\p{M}/u).test(ch)
    if (cat) continue
    // common fullwidth colon variants to ':'
    if (ch === '：') { out += ':'; continue }
    out += '-'
  }
  out = out.replace(/\s+/g, ' ').trim()
  if (!out) out = 'file'
  return out.slice(0, 150)
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string, filename: string }> }) {
  const { jobId, filename } = await params
  console.log('[FILE-DOWNLOAD] Request:', { jobId, filename })
  if (!jobId || !filename) return NextResponse.json({ error: "jobId and filename are required" }, { status: 400 })

  try {
    const backendPath = `/files/${encodeURIComponent(jobId)}/${encodeURIComponent(filename)}`
    console.log('[FILE-DOWNLOAD] Calling backend:', backendPath)
    const res = await fetch(backendUrl(backendPath))
    console.log('[FILE-DOWNLOAD] Backend response:', res.status, res.statusText)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json({ error: data.detail || data.error || 'Error downloading file' }, { status: res.status })
    }

    // Stream the response back to the client
    // Prefer streaming pass-through preserving backend headers, adjusting Content-Disposition safely
    const backendContentDisposition = res.headers.get('content-disposition')
    const originalName = filename
    const asciiName = asciiFallback(originalName)
    // RFC 5987 encoding for UTF-8 filename*
    const rfc5987 = encodeURIComponent(originalName).replace(/['()]/g, escape).replace(/%(?:7C|60|5E)/g, unescape)
    const contentType = res.headers.get('content-type') || 'application/octet-stream'

    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Length', res.headers.get('content-length') || '0')
    // Build a safe Content-Disposition
    headers.set('Content-Disposition', `attachment; filename="${asciiName}"; filename*=UTF-8''${rfc5987}`)
    // Removed X-Original-Filename to avoid Latin-1 ByteString errors for Unicode chars.
    // If needed, reintroduce with sanitized ASCII only: headers.set('X-Original-Filename', asciiName)

    // Stream body directly without buffering entire file (if supported)
    return new NextResponse(res.body, { headers })
  } catch (e) {
    console.error('[API] File download proxy error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
