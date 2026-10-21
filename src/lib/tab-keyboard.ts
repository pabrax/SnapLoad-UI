/**
 * Patrón WAI-ARIA de pestañas: flechas (con vuelta), Inicio y Fin.
 * Devuelve el índice a enfocar o null si la tecla no es de navegación (así Tab y el texto siguen funcionando).
 */
export function nextTabIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) return null
  switch (key) {
    case "ArrowRight":
      return (current + 1) % count
    case "ArrowLeft":
      return (current - 1 + count) % count
    case "Home":
      return 0
    case "End":
      return count - 1
    default:
      return null
  }
}
