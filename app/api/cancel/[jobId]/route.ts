import { type NextRequest, NextResponse } from "next/server"
import { backendUrl } from "@/src/lib/backend"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params

    if (!jobId) {
      return NextResponse.json({ error: "Job ID es requerido" }, { status: 400 })
    }

    console.log("[API] Cancelling job:", jobId)

    const cancelResponse = await fetch(backendUrl(`/cancel/${jobId}`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const result = await cancelResponse.json().catch(() => ({}))

    if (!cancelResponse.ok) {
      console.error("[API] Backend cancel error:", result)
      return NextResponse.json(
        { error: result.detail || result.error || "Error al cancelar job" },
        { status: cancelResponse.status }
      )
    }

    return NextResponse.json(result, { status: cancelResponse.status })

  } catch (error) {
    console.error("[API] Cancel proxy error:", error)
    return NextResponse.json(
      { error: "Error interno al cancelar descarga" },
      { status: 500 }
    )
  }
}
