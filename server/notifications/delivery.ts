import { buildNotificationContent } from "@/server/notifications/copy"
import { markNotificationSent } from "@/server/notifications/repository"
import type { PendingNotificationRow } from "@/server/notifications/repository"
import { sendEmail } from "@/server/email/send-email"
import { sendWebPush } from "@/server/push/web-push"
import { log } from "@/server/log"

function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  )
}

export async function deliverNotification(row: PendingNotificationRow): Promise<{
  push: boolean
  email: boolean
}> {
  const content = buildNotificationContent({
    type: row.type,
    leadHours: row.lead_hours,
    peerName: row.peer_name,
    referenceId: row.reference_id,
    appOrigin: appOrigin(),
  })

  let pushOk = false
  let emailOk = false

  if (row.push_subscription?.endpoint && row.push_subscription.keys) {
    pushOk = await sendWebPush(row.push_subscription, {
      title: content.title,
      body: content.body,
      url: content.href,
      tag: content.tag,
    })
  }

  if (row.email_verified && row.email) {
    emailOk = await sendEmail(row.email, content.title, content.html)
  }

  await markNotificationSent(row.id)

  log.info("notification_delivered", {
    notificationId: row.id,
    userId: row.user_id,
    type: row.type,
    leadHours: row.lead_hours,
    push: pushOk,
    email: emailOk,
  })

  return { push: pushOk, email: emailOk }
}

export async function sendPendingNotifications(): Promise<{
  processed: number
  pushSent: number
  emailSent: number
}> {
  const { fetchPendingForDelivery } = await import("@/server/notifications/repository")
  const pending = await fetchPendingForDelivery()

  let pushSent = 0
  let emailSent = 0

  for (const row of pending) {
    const result = await deliverNotification(row)
    if (result.push) pushSent += 1
    if (result.email) emailSent += 1
  }

  return { processed: pending.length, pushSent, emailSent }
}
