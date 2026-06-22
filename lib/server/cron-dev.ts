import { log } from "@/lib/server/log"

const DEV_NOTIFY_MS = 15 * 60 * 1000
const DEV_EXPIRE_MS = 60 * 1000
let notifyStarted = false
let expireStarted = false

export function startDevNotificationsCron() {
  if (notifyStarted || process.env.NODE_ENV !== "development") return
  if (!process.env.DATABASE_URL) return
  notifyStarted = true

  const tick = async () => {
    try {
      const { runNotificationsCron } = await import("@/lib/server/notifications/run-cron")
      await runNotificationsCron()
    } catch (e) {
      log.warn("dev_notify_cron_err", { err: e instanceof Error ? e.message : String(e) })
    }
  }

  void tick()
  setInterval(tick, DEV_NOTIFY_MS)
  log.info("dev_notify_cron_started", { intervalMs: DEV_NOTIFY_MS })
}

export function startDevExpireMatchesCron() {
  if (expireStarted || process.env.NODE_ENV !== "development") return
  if (!process.env.DATABASE_URL) return
  expireStarted = true

  const tick = async () => {
    try {
      const { runEnginesCron } = await import("@/lib/server/engines/expiration/expiration.worker")
      await runEnginesCron()
    } catch (e) {
      log.warn("dev_expire_cron_err", { err: e instanceof Error ? e.message : String(e) })
    }
  }

  void tick()
  setInterval(tick, DEV_EXPIRE_MS)
  log.info("dev_expire_cron_started", { intervalMs: DEV_EXPIRE_MS })
}
