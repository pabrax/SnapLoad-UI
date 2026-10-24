/** Wordmark: an equalizer mark plus the display-face name; the mark follows the active mode color. */
export function AudioHeader() {
  return (
    <header className="mb-8 text-center">
      <div className="mb-3 inline-flex items-end justify-center gap-3 md:gap-4">
        <svg aria-hidden="true" viewBox="0 0 40 40" className="mb-1.5 h-10 w-10 shrink-0 md:h-14 md:w-14">
          <rect x="3" y="18" width="7" height="19" rx="3.5" className="fill-mode" />
          <rect x="13" y="6" width="7" height="31" rx="3.5" className="fill-sun" />
          <rect x="23" y="12" width="7" height="25" rx="3.5" className="fill-mint" />
          <rect x="33" y="22" width="5" height="15" rx="2.5" className="fill-cassette" />
        </svg>
        <h1 className="font-display text-4xl leading-none tracking-tight text-cassette md:text-6xl">
          Snap<span className="text-mode">Load</span>
        </h1>
      </div>
      <p className="text-base font-medium text-muted-foreground md:text-lg">
        Descarga música y videos de YouTube y Spotify al instante
      </p>
    </header>
  )
}
