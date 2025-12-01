import * as Sentry from "@sentry/nextjs"

export function initSentry() {
  if (typeof window === "undefined") return

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

  if (!dsn) {
    console.warn("[v0] Sentry DSN not configured")
    return
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === "development",

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    beforeSend(event) {
      if (event.exception) {
        console.error("[v0] Sentry captured error:", event.exception)
      }
      return event
    },
  })
}

export { Sentry }
