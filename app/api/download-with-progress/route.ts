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

      return NextResponse.json(result, { status: downloadResponse.status })

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
