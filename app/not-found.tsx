import Link from "next/link"

export default function NotFound() {
  return (
    <main id="contenido" tabIndex={-1} data-mode="audio" className="backdrop flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <p aria-hidden="true" className="font-display text-7xl leading-none text-mode md:text-9xl">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">Página no encontrada</h1>
        <p className="mt-2 text-muted-foreground">La página que buscas no existe o la cinta se acabó.</p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-mode px-6 font-bold text-mode-ink shadow-[3px_3px_0_var(--cassette)] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
