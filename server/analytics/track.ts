import { getDb } from "@/server/db"
import { log } from "@/server/log"

export type AnalyticsEventName = "signup" | "like" | "match" | "message_sent" | "purchase"

export type TrackEventInput = {
  userId?: string | null
  properties?: Record<string, string | number | boolean>
}

/** Persist key product events; always logs even without DB. */
export async function trackServerEvent(
  event: AnalyticsEventName | string,
  input: TrackEventInput = {}
): Promise<void> {
  const properties = input.properties ?? {}
  log.info("analytics_event", {
    event,
    userId: input.userId ?? undefined,
    properties,
  })

  const db = getDb()
  if (!db) return

  try {
    await db`
      INSERT INTO analytics_events (user_id, event, properties)
      VALUES (${input.userId ?? null}, ${event}, ${db.json(JSON.parse(JSON.stringify(properties)))})
    `
  } catch {
    /* non-blocking */
  }
}
