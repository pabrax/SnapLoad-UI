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

      return NextResponse.json(result, { status: downloadResponse.status })

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
