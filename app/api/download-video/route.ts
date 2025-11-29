import { type NextRequest, NextResponse } from "next/server"
import { backendUrl } from "@/src/lib/backend"

export async function POST(request: NextRequest) {
  try {
    const { url, format } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL es requerida" }, { status: 400 })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)

    try {
      // Pre-chequear con /lookup para evitar encolar si ya existe
      const lookupParams = new URLSearchParams()
      lookupParams.set('url', url)
      lookupParams.set('type', 'video')
      if (format) lookupParams.set('format', format)
      
      console.log('[VIDEO-PROXY] Lookup params:', { url, format, lookupUrl: `/lookup?${lookupParams.toString()}` })
      
      const lookupRes = await fetch(backendUrl(`/lookup?${lookupParams.toString()}`), { 
        method: 'GET', 
        signal: controller.signal 
      })
      const lookup = await lookupRes.json().catch(() => ({}))
      
      console.log('[VIDEO-PROXY] Lookup response:', { status: lookupRes.status, lookup })
      
      // Si ya está listo, devolver inmediatamente
      if (lookupRes.ok && lookup?.status === 'ready' && Array.isArray(lookup.files)) {
        console.log('[VIDEO-PROXY] Cache hit! Reusing:', lookup.files)
        clearTimeout(timeoutId)
        return NextResponse.json({
          message: 'Reusado desde lookup',
          url,
          source: 'video',
          files: lookup.files,
          status: 'ready',
          job_id: lookup.job_id || null,
          format: lookup.format
        }, { status: 200 })
      }
      
      // Si está pendiente, devolver el job_id existente
      if (lookupRes.ok && lookup?.status === 'pending' && lookup?.job_id) {
        console.log('[VIDEO-PROXY] Pending job found:', lookup.job_id)
        clearTimeout(timeoutId)
        return NextResponse.json({
          message: 'Descarga ya en progreso',
          job_id: lookup.job_id,
          url,
          source: 'video',
          status: 'pending',
          format: lookup.format
        }, { status: 202 })
      }

      console.log('[VIDEO-PROXY] Cache miss, enqueueing new job')
      // Miss: encolar nueva descarga
      const downloadResponse = await fetch(backendUrl("/download/video"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, format }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const result = await downloadResponse.json().catch(() => ({}))

      if (!downloadResponse.ok) {
        console.error("[API] Backend error (video):", result)
        return NextResponse.json({ error: result.detail || result.error || "Error al iniciar la descarga de video" }, { status: downloadResponse.status })
      }

      // Normalizar respuesta para consistencia
      const normalized = {
        ...result,
        status: result.status || (Array.isArray(result.files) && result.files.length > 0 ? 'ready' : (downloadResponse.status === 202 ? 'pending' : 'ok'))
      }
      return NextResponse.json(normalized, { status: downloadResponse.status })

    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        console.error("[API] Request timeout (video)")
        return NextResponse.json({ error: "Timeout al iniciar la descarga" }, { status: 408 })
      }
      throw error
    }

  } catch (error) {
    console.error("[API] Download video proxy error:", error)
    return NextResponse.json({ error: "Error interno al iniciar la descarga de video" }, { status: 500 })
  }
}
