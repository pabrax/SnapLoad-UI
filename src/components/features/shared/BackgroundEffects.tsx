/**
 * Fondo decorativo estático: dos gradientes radiales en una sola capa (sin blur ni animación,
 * que son caros de pintar y no aportan información).
 */
export function BackgroundEffects() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_15%_8%,rgb(59_130_246/0.16),transparent),radial-gradient(50%_45%_at_88%_95%,rgb(147_51_234/0.14),transparent),radial-gradient(35%_30%_at_55%_50%,rgb(20_184_166/0.07),transparent)]"
    />
  )
}
