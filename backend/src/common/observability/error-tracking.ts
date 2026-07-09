export function logStructured(
  level: 'info' | 'warn' | 'error',
  message: string,
  payload: Record<string, unknown> = {},
) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...payload,
  }

  if (level === 'error') {
    console.error(JSON.stringify(entry))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export async function initErrorTracking() {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) {
    logStructured('info', 'error_tracking_disabled', { reason: 'SENTRY_DSN not set' })
    return
  }

  try {
    // Optional dependency path: only load when configured.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/node')
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
    })
    logStructured('info', 'error_tracking_enabled', { provider: 'sentry' })
  } catch (error: any) {
    logStructured('warn', 'error_tracking_init_failed', {
      error: error?.message || String(error),
    })
  }
}

export function captureException(error: unknown, context: Record<string, unknown> = {}) {
  logStructured('error', 'uncaught_exception', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  })

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/node')
    if (process.env.SENTRY_DSN && Sentry?.captureException) {
      Sentry.withScope((scope: any) => {
        Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value))
        Sentry.captureException(error)
      })
    }
  } catch {
    // Ignore missing Sentry package when DSN is unset / package unavailable.
  }
}
