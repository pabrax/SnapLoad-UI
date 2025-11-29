import { type NextRequest, NextResponse } from "next/server"
import { backendUrl } from "@/src/lib/backend"

export async function POST(request: NextRequest) {
  try {
    const { url, quality = "192", output_format = "mp3" } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL es requerida" }, { status: 400 })
    }

    console.log("[API] Proxying download-with-progress to backend for URL:", url)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)

    try {
      // 1) Pre-chequear con /lookup para evitar encolar si ya existe
      const lookupParams = new URLSearchParams()
      lookupParams.set('url', url)
      lookupParams.set('type', 'audio')
      if (quality) lookupParams.set('quality', String(quality))
      const lookupRes = await fetch(backendUrl(`/lookup?${lookupParams.toString()}`), { method: 'GET', signal: controller.signal })
      const lookup = await lookupRes.json().catch(() => ({}))
      if (lookupRes.ok && lookup?.status === 'ready' && Array.isArray(lookup.files)) {
        clearTimeout(timeoutId)
        return NextResponse.json({
          message: 'Reusado desde lookup',
          url,
          source: 'audio',
          files: lookup.files,
          status: 'ready',
          job_id: lookup.job_id || null
        }, { status: 200 })
      }
      if (lookupRes.ok && lookup?.status === 'pending' && lookup?.job_id) {
        // devolvemos el mismo contrato que /download para que el front haga polling
        clearTimeout(timeoutId)
        return NextResponse.json({
          message: 'Descarga ya en progreso',
          job_id: lookup.job_id,
          url,
          source: 'audio'
        }, { status: 202 })
      }

      const downloadResponse = await fetch(backendUrl("/download"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, quality, output_format }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const result = await downloadResponse.json().catch(() => ({}))

      if (!downloadResponse.ok) {
        console.error("[API] Backend error:", result)
        return NextResponse.json({ error: result.detail || result.error || "Error al iniciar la descarga" }, { status: downloadResponse.status })
      }

      // Normalizar: si hay files, tratamos como ready
      const normalized = {
        ...result,
        status: result.status || (Array.isArray(result.files) && result.files.length > 0 ? 'ready' : (downloadResponse.status === 202 ? 'pending' : 'ok'))
      }
      return NextResponse.json(normalized, { status: downloadResponse.status })

    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        console.error("[API] Request timeout")
        return NextResponse.json({ error: "Timeout al iniciar la descarga" }, { status: 408 })
      }
      throw error
    }

  } catch (error) {
    console.error("[API] Download with progress proxy error:", error)
    return NextResponse.json({ error: "Error interno al iniciar la descarga" }, { status: 500 })
  }
}
