type ErrorReportPayload = {
  message: string
  stack?: string
  source?: string
  url?: string
  extra?: Record<string, unknown>
}

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

function emitConsole(payload: ErrorReportPayload) {
  console.error('[app-error]', {
    timestamp: new Date().toISOString(),
    ...payload,
  })
}

export function reportError(error: unknown, extra: Record<string, unknown> = {}) {
  const payload: ErrorReportPayload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    source: 'frontend',
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    extra,
  }

  emitConsole(payload)

  // Optional runtime Sentry (loaded only when DSN is present).
  if (SENTRY_DSN && typeof window !== 'undefined') {
    const w = window as any
    if (w.Sentry?.captureException) {
      w.Sentry.captureException(error, { extra })
    }
  }
}

export function initFrontendObservability() {
  if (typeof window === 'undefined') return

  window.addEventListener('error', (event) => {
    reportError(event.error || event.message, {
      type: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, { type: 'unhandledrejection' })
  })
}
