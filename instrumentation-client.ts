/**
 * Browser error reporting. Only NEXT_PUBLIC_* variables reach the browser, so without
 * NEXT_PUBLIC_SENTRY_DSN set at build time Sentry stays off — and is not downloaded at all
 * (the SDK is ~120 KB gzipped, a big share of a phone's first load).
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

type SentryModule = typeof import("@sentry/nextjs")
let sentry: SentryModule | null = null

if (dsn) {
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
      debug: false,
    })
    sentry = Sentry
  })
}

export function onRouterTransitionStart(...args: Parameters<SentryModule["captureRouterTransitionStart"]>) {
  sentry?.captureRouterTransitionStart(...args)
}
