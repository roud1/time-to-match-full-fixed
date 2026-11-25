/**
 * Firebase Cloud Messaging (HTTP v1) for the Android app. Inert until FIREBASE_SERVICE_ACCOUNT is
 * set (the service-account JSON from the Firebase console, raw or base64). No extra SDK: the OAuth
 * token is a JWT signed with the service account key (jose) and cached until it expires.
 */

import { SignJWT, importPKCS8 } from "jose"
import { getDb } from "@/server/db"
import { log } from "@/server/log"

type ServiceAccount = { project_id: string; client_email: string; private_key: string }

let account: ServiceAccount | null | undefined
let cachedToken: { value: string; expiresAt: number } | null = null

function readAccount(): ServiceAccount | null {
  if (account !== undefined) return account
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim()
  account = null
  if (!raw) return null
  try {
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")
    const parsed = JSON.parse(json) as Partial<ServiceAccount>
    if (parsed.project_id && parsed.client_email && parsed.private_key) {
      account = { project_id: parsed.project_id, client_email: parsed.client_email, private_key: parsed.private_key }
    }
  } catch {
    log.warn("fcm_service_account_invalid")
  }
  return account
}

export function isFcmConfigured(): boolean {
  return readAccount() !== null
}

async function accessToken(sa: ServiceAccount): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value
  try {
    const key = await importPKCS8(sa.private_key, "RS256")
    const now = Math.floor(Date.now() / 1000)
    const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuer(sa.client_email)
      .setSubject(sa.client_email)
      .setAudience("https://oauth2.googleapis.com/token")
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(key)
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      log.warn("fcm_token_failed", { status: res.status })
      return null
    }
    const body = (await res.json()) as { access_token: string; expires_in: number }
    cachedToken = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 }
    return body.access_token
  } catch (err) {
    log.warn("fcm_token_error", { err: err instanceof Error ? err.message : String(err) })
    return null
  }
}

export type FcmPayload = { title: string; body: string; url: string; tag: string }

/** Sends to every registered device of the user; drops tokens Firebase reports as gone. */
export async function sendFcmToUser(userId: string, payload: FcmPayload): Promise<number> {
  const sa = readAccount()
  const sql = getDb()
  if (!sa || !sql) return 0
  const devices = await sql<{ token: string }[]>`SELECT token FROM push_devices WHERE user_id = ${userId}`
  if (devices.length === 0) return 0
  const token = await accessToken(sa)
  if (!token) return 0

  let sent = 0
  for (const { token: deviceToken } of devices) {
    try {
      const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: {
            token: deviceToken,
            notification: { title: payload.title, body: payload.body },
            data: { url: payload.url, tag: payload.tag },
            android: {
              priority: "high",
              collapse_key: payload.tag,
              notification: { channel_id: "luvia_default", tag: payload.tag, default_sound: true },
            },
          },
        }),
        signal: AbortSignal.timeout(10_000),
      })
      if (res.ok) {
        sent++
      } else if (res.status === 404 || res.status === 400) {
        // UNREGISTERED / INVALID_ARGUMENT: the app was removed or the token is stale.
        await sql`DELETE FROM push_devices WHERE token = ${deviceToken}`
      } else {
        log.warn("fcm_send_failed", { status: res.status })
      }
    } catch (err) {
      log.warn("fcm_send_error", { err: err instanceof Error ? err.message : String(err) })
    }
  }
  return sent
}
