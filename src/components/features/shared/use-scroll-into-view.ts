import { useEffect, useRef } from "react"

/**
 * Brings a status panel (progress, success, error) into view when it appears, so on small screens the
 * user sees the result of pressing the button. Smooth scroll only when motion is not reduced.
 */
export function useScrollIntoView<T extends HTMLElement>(trigger: unknown = true) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" })
  }, [trigger])
  return ref
}
