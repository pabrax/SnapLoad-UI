import { NextResponse } from "next/server"
import { isValidContentUrl } from "@/src/lib/validators"

// Minimal info endpoint for preview purposes.
// It validates the URL and returns basic metadata (platform inference only).
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url") || ""

    if (!url) {
      return NextResponse.json({ success: false, error: "Missing url" }, { status: 400 })
    }

    if (!isValidContentUrl(url)) {
      return NextResponse.json({ success: false, error: "URL no soportada" }, { status: 400 })
    }

    const lower = url.toLowerCase()
    const platform = lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("music.youtube.com")
      ? "youtube"
      : lower.includes("open.spotify.com") || lower.startsWith("spotify:")
      ? "spotify"
      : "unknown"

    return NextResponse.json({
      success: true,
      metadata: {
        platform,
      },
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
  }
}
