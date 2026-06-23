import { scheduleExpiryNotifications } from "@/server/notifications/repository"
import { sendPendingNotifications } from "@/server/notifications/delivery"
import { log } from "@/server/log"

export async function runNotificationsCron() {
  const scheduled = await scheduleExpiryNotifications()
  const sent = await sendPendingNotifications()
  log.info("notifications_cron_done", { scheduled, sent })
  return { scheduled, sent }
}
