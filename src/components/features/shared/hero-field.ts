// Shared class names for the paste-field "hero" and the primary action, so audio and video forms stay identical.
export const heroLabelClass = "block text-base font-bold text-foreground"

export const heroInputClass =
  "h-14 rounded-2xl border-2 border-mode bg-background pl-4 pr-16 text-base text-foreground shadow-[4px_4px_0_var(--mode)] placeholder:text-muted-foreground focus-visible:border-mode focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring md:h-16 md:text-lg"

export const primaryActionClass =
  "h-14 w-full rounded-2xl bg-mode text-base font-bold text-mode-ink shadow-[4px_4px_0_var(--cassette)] transition-transform hover:bg-mode hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--cassette)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:opacity-60 disabled:shadow-none"

export const cancelActionClass =
  "h-11 w-full rounded-2xl border-2 border-tomato bg-transparent text-sm font-bold text-tomato hover:bg-tomato hover:text-plum"
