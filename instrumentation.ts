export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { log } = await import("@/lib/server/log")
    log.info("next_instrumentation_boot", { node: process.version })
  }
}
