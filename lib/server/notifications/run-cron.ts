import { scheduleExpiryNotifications } from "@/lib/server/notifications/repository"
import { sendPendingNotifications } from "@/lib/server/notifications/delivery"
import { log } from "@/lib/server/log"

export async function runNotificationsCron() {
  const scheduled = await scheduleExpiryNotifications()
  const sent = await sendPendingNotifications()
  log.info("notifications_cron_done", { scheduled, sent })
  return { scheduled, sent }
}
