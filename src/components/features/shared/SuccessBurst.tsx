import { Check } from "lucide-react"

const DOTS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2
  const distance = i % 2 === 0 ? 44 : 32
  return {
    dx: Math.round(Math.cos(angle) * distance),
    dy: Math.round(Math.sin(angle) * distance),
    color: ["bg-coral", "bg-sun", "bg-violet", "bg-mint", "bg-cassette"][i % 5],
  }
})

/** Check badge with a one-shot (600 ms) burst of colored dots. Reduced motion: static badge, no dots. */
export function SuccessBurst() {
  return (
    <span aria-hidden="true" className="relative flex size-10 shrink-0 items-center justify-center">
      {DOTS.map((dot, i) => (
        <span
          key={i}
          className={`burst-dot ${dot.color}`}
          style={{ "--dx": `${dot.dx}px`, "--dy": `${dot.dy}px` } as React.CSSProperties}
        />
      ))}
      <span className="pop-in flex size-10 items-center justify-center rounded-full bg-mint text-plum">
        <Check className="size-6" strokeWidth={3} />
      </span>
    </span>
  )
}
