"use client"

import dynamic from "next/dynamic"

// Los toasts solo aparecen tras una acción: no hace falta en la carga inicial.
const Toaster = dynamic(() => import("./toaster").then((m) => m.Toaster), { ssr: false })

export function LazyToaster() {
  return <Toaster />
}
