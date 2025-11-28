"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card } from "@/src/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Badge } from "@/src/components/ui/badge"
import { Download, Loader2, Info, AlertCircle, CheckCircle2 } from "lucide-react"
import { isValidContentUrl } from "@/src/lib/validators"

type JobStatus = "idle" | "loading" | "success" | "error" | "polling"

const VIDEO_FORMATS = [
  { value: "mp4", label: "MP4" },
  { value: "webm", label: "WebM" },
]

export default function VideoDownloader({ noCard }: { noCard?: boolean } = {}) {
  const [url, setUrl] = useState("")
  const [format, setFormat] = useState("mp4")
  const [status, setStatus] = useState<JobStatus>("idle")
  const [backendStatus, setBackendStatus] = useState<"unknown" | "connected" | "disconnected">("unknown")
  const [files, setFiles] = useState<Array<{ name: string; size?: number }>>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)

  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch("/api/health")
        setBackendStatus(r.ok ? "connected" : "disconnected")
      } catch {
        setBackendStatus("disconnected")
      }
    }
    check()
  }, [])

  const validate = (u: string) => {
    try {
      return isValidContentUrl(u)
    } catch {
      return false
    }
  }

  const downloadBlob = async (jid: string, filename: string) => {
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(jid)}/download/${encodeURIComponent(filename)}`)
      if (!res.ok) throw new Error(`Download failed: ${res.status}`)
      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (e) {
      console.error("file download error", e)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setErrorMsg(null)
    setFiles([])
    setJobId(null)

    if (!url.trim()) {
      setErrorMsg("Introduce una URL")
      setStatus("error")
      return
    }
    if (!validate(url)) {
      setErrorMsg("URL no soportada por el backend")
      setStatus("error")
      return
    }

    setStatus("loading")

    try {
      const resp = await fetch("/api/download-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format }),
      })
      if (!resp.ok) throw new Error("Error encolar job")
      const data = await resp.json()
      const jid = data.job_id || data.download_id
      if (!jid) throw new Error("No job id returned")
      setJobId(jid)

      setStatus("polling")

      // Poll status
      let finished = false
      while (!finished) {
        await new Promise((r) => setTimeout(r, 2000))
        try {
          const sres = await fetch(`/api/status/${encodeURIComponent(jid)}`)
          if (!sres.ok) continue
          const sdata = await sres.json()
          const st = (sdata.status || sdata.meta?.status || "").toLowerCase()
          if (["success", "failed", "cancelled"].includes(st)) {
            finished = true
            if (st !== "success") {
              throw new Error(sdata.meta?.error || "Job finalizado con error")
            }
          }
        } catch (err) {
          console.warn("poll error", err)
        }
      }

      // get files
      const fres = await fetch(`/api/files/${encodeURIComponent(jid)}`)
      if (!fres.ok) throw new Error("Error listando ficheros")
      const fdata = await fres.json()
      const list = fdata.files || []
      setFiles(list.map((f: any) => ({ name: f.name, size: f.size })))
      setStatus("success")

      // auto-download sequentially
      for (const f of list) {
        await downloadBlob(jid, f.name)
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err?.message || String(err))
      setStatus("error")
    }
  }

  const inner = (
    <div className="relative z-10">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="video-url" className="text-sm font-bold text-foreground uppercase tracking-wide">URL del Video</label>
          <Input id="video-url" placeholder="Ej: https://www.youtube.com/watch?v=..." value={url} onChange={(e) => setUrl(e.target.value)} className="h-12 text-base bg-muted/50 border-2 border-muted focus:border-primary transition-colors pl-4" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">Formato de Video</label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="h-12 text-base bg-muted/50 border-2 border-muted focus:border-primary">
              <SelectValue placeholder="Selecciona formato" />
            </SelectTrigger>
            <SelectContent>
              {VIDEO_FORMATS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={status === "loading" || status === "polling" || backendStatus !== "connected"} className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30">
            {(status === "loading" || status === "polling") ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Procesando...</>
            ) : (
              <><Download className="w-5 h-5 mr-2" />Descargar Video</>
            )}
          </Button>
        </div>

        {status === "success" && files.length > 0 && (
          <div className="mt-3 p-3 bg-muted/30 border border-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-primary" /> <span className="font-semibold text-xs uppercase">Archivos</span></div>
            <ul className="space-y-1">
              {files.map((f) => (
                <li key={f.name} className="flex items-center justify-between">
                  <div className="text-sm">{f.name}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{f.size ? `${Math.round(f.size / 1024)} KB` : "-"}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => jobId && downloadBlob(jobId, f.name)}>Descargar</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(status === "error" || errorMsg) && (
          <div className="mt-3 p-3 bg-destructive/20 border-2 border-destructive rounded-lg flex items-start gap-3 backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-destructive">Error</p>
              <p className="text-xs text-destructive/80 mt-1">{errorMsg || "No se pudo completar la operación"}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  )

  if (noCard) {
    return inner
  }

  return (
    <Card className="relative p-6 md:p-8 bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700/50 shadow-2xl shadow-slate-950/50">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-teal-500/10 blur-xl" />
      {inner}
    </Card>
  )
}
