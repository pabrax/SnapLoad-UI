/**
 * Error types synchronized with backend exceptions
 * Matches: app/core/exceptions.py
 */

// ============================================================================
// Backend Error Response Structure
// ============================================================================

export interface BackendErrorResponse {
  detail: string
  message?: string
  details?: string
  error?: string
}

export class SnapLoadError extends Error {
  public type: string
  public details?: string

  constructor(message: string, details?: string) {
    super(message)
    this.name = "SnapLoadError"
    this.type = "SnapLoadError"
    this.details = details
  }
}

export class InvalidURLError extends SnapLoadError {
  public url?: string

  constructor(message: string, url?: string, details?: string) {
    super(message, details)
    this.name = "InvalidURLError"
    this.type = "InvalidURLError"
    this.url = url
  }
}

export class InvalidQualityError extends SnapLoadError {
  public quality?: string

  constructor(message: string, quality?: string, details?: string) {
    super(message, details)
    this.name = "InvalidQualityError"
    this.type = "InvalidQualityError"
    this.quality = quality
  }
}

export class InvalidFormatError extends SnapLoadError {
  public format?: string

  constructor(message: string, format?: string, details?: string) {
    super(message, details)
    this.name = "InvalidFormatError"
    this.type = "InvalidFormatError"
    this.format = format
  }
}

export class JobNotFoundError extends SnapLoadError {
  public jobId?: string

  constructor(message: string, jobId?: string, details?: string) {
    super(message, details)
    this.name = "JobNotFoundError"
    this.type = "JobNotFoundError"
    this.jobId = jobId
  }
}

export class FileNotFoundError extends SnapLoadError {
  public filename?: string
  public path?: string

  constructor(message: string, filename?: string, path?: string, details?: string) {
    super(message, details)
    this.name = "FileNotFoundError"
    this.type = "FileNotFoundError"
    this.filename = filename
    this.path = path
  }
}

export class DownloadFailedError extends SnapLoadError {
  public url?: string
  public exitCode?: number

  constructor(message: string, url?: string, exitCode?: number, details?: string) {
    super(message, details)
    this.name = "DownloadFailedError"
    this.type = "DownloadFailedError"
    this.url = url
    this.exitCode = exitCode
  }
}

export class ProcessExecutionError extends SnapLoadError {
  public command?: string
  public exitCode?: number

  constructor(message: string, command?: string, exitCode?: number, details?: string) {
    super(message, details)
    this.name = "ProcessExecutionError"
    this.type = "ProcessExecutionError"
    this.command = command
    this.exitCode = exitCode
  }
}

// ============================================================================
// Error Parsing Utilities
// ============================================================================

/**
 * Parse backend error response and create appropriate error instance
 */
export function parseBackendError(error: BackendErrorResponse | string): SnapLoadError {
  const errorText = typeof error === "string" ? error : error.detail || error.message || "Error desconocido"

  // Parse error type from message structure
  // Backend format: "Type - Details"
  const parts = errorText.split(" - ")
  const mainMessage = parts[0]
  const details = parts.slice(1).join(" - ")

  // Match error types
  if (mainMessage.includes("URL inválida") || mainMessage.includes("URL no")) {
    const urlMatch = details?.match(/URL: ([^\|]+)/)
    const url = urlMatch ? urlMatch[1].trim() : undefined
    return new InvalidURLError(mainMessage, url, details)
  }

  if (mainMessage.includes("Calidad") || mainMessage.includes("quality")) {
    const qualityMatch = details?.match(/Calidad recibida: ([^\|]+)/)
    const quality = qualityMatch ? qualityMatch[1].trim() : undefined
    return new InvalidQualityError(mainMessage, quality, details)
  }

  if (mainMessage.includes("Formato") || mainMessage.includes("format")) {
    const formatMatch = details?.match(/Formato recibido: ([^\|]+)/)
    const format = formatMatch ? formatMatch[1].trim() : undefined
    return new InvalidFormatError(mainMessage, format, details)
  }

  if (mainMessage.includes("Job no encontrado")) {
    const jobIdMatch = details?.match(/Job ID: ([^\|]+)/)
    const jobId = jobIdMatch ? jobIdMatch[1].trim() : undefined
    return new JobNotFoundError(mainMessage, jobId, details)
  }

  if (mainMessage.includes("Archivo no encontrado")) {
    const filenameMatch = details?.match(/Archivo: ([^\|]+)/)
    const pathMatch = details?.match(/Ruta: ([^\|]+)/)
    const filename = filenameMatch ? filenameMatch[1].trim() : undefined
    const path = pathMatch ? pathMatch[1].trim() : undefined
    return new FileNotFoundError(mainMessage, filename, path, details)
  }

  if (mainMessage.includes("Descarga fallida")) {
    const urlMatch = details?.match(/URL: ([^\|]+)/)
    const exitCodeMatch = details?.match(/Código de salida: (\d+)/)
    const url = urlMatch ? urlMatch[1].trim() : undefined
    const exitCode = exitCodeMatch ? parseInt(exitCodeMatch[1], 10) : undefined
    return new DownloadFailedError(mainMessage, url, exitCode, details)
  }

  if (mainMessage.includes("Error al ejecutar proceso")) {
    const commandMatch = details?.match(/Comando: ([^\|]+)/)
    const exitCodeMatch = details?.match(/Código de salida: (\d+)/)
    const command = commandMatch ? commandMatch[1].trim() : undefined
    const exitCode = exitCodeMatch ? parseInt(exitCodeMatch[1], 10) : undefined
    return new ProcessExecutionError(mainMessage, command, exitCode, details)
  }

  // Generic error
  return new SnapLoadError(mainMessage, details)
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: SnapLoadError | Error | unknown): string {
  if (error instanceof InvalidURLError) {
    return "La URL proporcionada no es válida. Verifica que sea de Spotify o YouTube."
  }

  if (error instanceof InvalidQualityError) {
    return "La calidad de audio seleccionada no es válida. Usa valores como 128k, 192k, 320k."
  }

  if (error instanceof InvalidFormatError) {
    return "El formato de video seleccionado no es válido."
  }

  if (error instanceof JobNotFoundError) {
    return "No se encontró el trabajo de descarga solicitado."
  }

  if (error instanceof FileNotFoundError) {
    return "No se encontró el archivo solicitado."
  }

  if (error instanceof DownloadFailedError) {
    return "La descarga falló. Verifica la URL e intenta nuevamente."
  }

  if (error instanceof ProcessExecutionError) {
    return "Error al procesar el archivo. Intenta nuevamente más tarde."
  }

  if (error instanceof SnapLoadError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Ocurrió un error inesperado"
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: SnapLoadError | Error): boolean {
  if (error instanceof ProcessExecutionError) return true
  if (error instanceof DownloadFailedError) return true
  if (error instanceof SnapLoadError && error.message.includes("timeout")) return true
  if (error instanceof SnapLoadError && error.message.includes("red")) return true
  return false
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error: SnapLoadError | Error): "info" | "warning" | "error" {
  if (error instanceof InvalidURLError) return "warning"
  if (error instanceof InvalidQualityError) return "warning"
  if (error instanceof InvalidFormatError) return "warning"
  if (error instanceof JobNotFoundError) return "info"
  if (error instanceof FileNotFoundError) return "info"
  return "error"
}
