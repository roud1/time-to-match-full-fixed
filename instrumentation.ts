export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
    const { log } = await import("@/lib/server/log")
    log.info("next_instrumentation_boot", { node: process.version })
    const { validateProductionEnv } = await import("@/lib/server/env")
    validateProductionEnv()
    const { startDevNotificationsCron, startDevExpireMatchesCron, startDevAiAnalysisCron } =
      await import("@/lib/server/cron-dev")
    startDevNotificationsCron()
    startDevExpireMatchesCron()
    startDevAiAnalysisCron()
  }
}

export const onRequestError = async (...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>) => {
  const { captureRequestError } = await import("@sentry/nextjs")
  return captureRequestError(...args)
}
