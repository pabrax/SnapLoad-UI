/**
 * Hook for handling backend errors with toast notifications
 */

import { useToast } from "@/src/hooks/use-toast"
import { parseBackendError, getUserFriendlyMessage, getErrorSeverity, isRetryableError } from "@/src/types/errors"
import { BUTTON_LABELS } from "@/src/constants/messages"
import type { SnapLoadError } from "@/src/types/errors"

export interface ErrorHandlerOptions {
  /** Show toast notification */
  showToast?: boolean
  /** Custom error message override */
  customMessage?: string
  /** Callback for retry action */
  onRetry?: () => void
  /** Additional context for logging */
  context?: string
}

export function useErrorHandler() {
  const { toast } = useToast()

  /**
   * Handle backend error with appropriate user feedback
   */
  const handleError = (
    error: unknown,
    options: ErrorHandlerOptions = {}
  ): SnapLoadError => {
    const {
      showToast = true,
      customMessage,
      onRetry,
      context,
    } = options

    // Parse error
    let parsedError: SnapLoadError
    if (typeof error === "object" && error !== null && "detail" in error) {
      parsedError = parseBackendError(error as any)
    } else if (error instanceof Error) {
      parsedError = parseBackendError(error.message)
    } else if (typeof error === "string") {
      parsedError = parseBackendError(error)
    } else {
      parsedError = parseBackendError("Error desconocido")
    }

    // Log error with context
    const logMessage = context ? `[${context}]` : ""
    console.error(`${logMessage} Error:`, parsedError)
    if (parsedError.details) {
      console.error(`${logMessage} Details:`, parsedError.details)
    }

    // Show toast if requested
    if (showToast) {
      const severity = getErrorSeverity(parsedError)
      const message = customMessage || getUserFriendlyMessage(parsedError)
      const canRetry = isRetryableError(parsedError)

      toast({
        variant: severity === "error" ? "destructive" : "default",
        title: severity === "error" ? "Error" : severity === "warning" ? "Advertencia" : "Información",
        description: message,
        action: canRetry && onRetry ? {
          altText: BUTTON_LABELS.RETRY,
          onClick: onRetry,
        } as any : undefined,
      })
    }

    return parsedError
  }

  /**
   * Handle fetch response error
   */
  const handleFetchError = async (
    response: Response,
    options: ErrorHandlerOptions = {}
  ): Promise<SnapLoadError> => {
    let errorData: any
    try {
      errorData = await response.json()
    } catch {
      errorData = { detail: `Error HTTP ${response.status}: ${response.statusText}` }
    }

    return handleError(errorData, {
      ...options,
      context: options.context || `HTTP ${response.status}`,
    })
  }

  /**
   * Wrap async function with error handling
   */
  const withErrorHandling = <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: ErrorHandlerOptions = {}
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args)
      } catch (error) {
        handleError(error, options)
        return null
      }
    }
  }

  return {
    handleError,
    handleFetchError,
    withErrorHandling,
  }
}
