import { getDb } from "@/server/db"
import { pushLang } from "@/server/push/push-copy"

/** Stores (or moves to this user) an Android app push token. */
export async function registerPushDevice(input: {
  userId: string
  token: string
  platform: "android" | "ios"
  locale?: string | null
}): Promise<void> {
  const sql = getDb()
  if (!sql) return
  const locale = input.locale ? pushLang(input.locale) : null
  await sql`
    INSERT INTO push_devices (token, user_id, platform, locale)
    VALUES (${input.token}, ${input.userId}, ${input.platform}, ${locale})
    ON CONFLICT (token) DO UPDATE
      SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform,
          locale = COALESCE(EXCLUDED.locale, push_devices.locale), last_seen_at = now()
  `
}

export async function unregisterPushDevice(userId: string, token: string): Promise<void> {
  const sql = getDb()
  if (!sql) return
  await sql`DELETE FROM push_devices WHERE token = ${token} AND user_id = ${userId}`
}

export async function savePushLocale(userId: string, locale: string): Promise<void> {
  const sql = getDb()
  if (!sql) return
  await sql`
    UPDATE users SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object('pushLocale', ${pushLang(locale)}::text)
    WHERE id = ${userId}
  `
}
