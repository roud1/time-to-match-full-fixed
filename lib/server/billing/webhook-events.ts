import { getDb } from "@/lib/server/db"

/** Mark event claimed for processing; returns false if already recorded. */
export async function claimStripeWebhookEvent(eventId: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false

  const rows = await db<{ event_id: string }[]>`
    INSERT INTO stripe_webhook_events (event_id)
    VALUES (${eventId})
    ON CONFLICT (event_id) DO NOTHING
    RETURNING event_id
  `
  return rows.length > 0
}

export async function releaseStripeWebhookEvent(eventId: string): Promise<void> {
  const db = getDb()
  if (!db) return
  await db`DELETE FROM stripe_webhook_events WHERE event_id = ${eventId}`
}
