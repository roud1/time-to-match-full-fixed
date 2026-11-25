/**
 * Instant push to a user on every channel they enabled: web push (browser / iPhone home-screen
 * app) and Firebase (Android app). Called right when a like, match or message happens, so
 * delivery no longer waits for the scheduled job.
 */

import { getDb } from "@/server/db"
import { log } from "@/server/log"
import { discoverIdToNumeric } from "@/client/lib/discover/map-profile"
import { sendWebPush } from "@/server/push/web-push"
import { sendFcmToUser } from "@/server/push/fcm"
import { pushLang, pushText, type PushKind } from "@/server/push/push-copy"
import type { PushSubscriptionJson } from "@/server/push/types"

/** Chat messages: at most one push per conversation in this window. */
export const MESSAGE_PUSH_THROTTLE_SECONDS = 180

function hrefFor(kind: PushKind, peerUserId: string | null): string {
  if (kind === "like") return "/app?tab=likes"
  return peerUserId ? `/app?tab=chat&with=${discoverIdToNumeric(peerUserId)}` : "/app?tab=chat"
}

export async function pushToUser(input: {
  userId: string
  kind: PushKind
  peerUserId: string | null
  peerName: string | null
}): Promise<{ web: boolean; native: number }> {
  const sql = getDb()
  if (!sql) return { web: false, native: 0 }
  const [user] = await sql<{ push_subscription: PushSubscriptionJson | null; lang: string | null; device_lang: string | null }[]>`
    SELECT push_subscription, profile->>'pushLocale' AS lang,
      (SELECT locale FROM push_devices d WHERE d.user_id = u.id ORDER BY last_seen_at DESC LIMIT 1) AS device_lang
    FROM users u WHERE id = ${input.userId}
  `
  if (!user) return { web: false, native: 0 }
  const { title, body } = pushText(input.kind, pushLang(user.lang ?? user.device_lang), input.peerName)
  const url = hrefFor(input.kind, input.peerUserId)
  const tag = input.kind === "like" ? "luvia-like" : `luvia-${input.kind}-${input.peerUserId ?? "x"}`

  let web = false
  if (user.push_subscription?.endpoint && user.push_subscription.keys) {
    web = await sendWebPush(user.push_subscription, { title, body, url, tag })
  }
  const native = await sendFcmToUser(input.userId, { title, body, url, tag })
  log.info("push_instant", { kind: input.kind, web, native })
  return { web, native }
}

/**
 * New chat message → push to the recipient, unless one was already sent for this conversation in
 * the last few minutes (an active conversation should not buzz on every message).
 */
export async function pushNewMessage(input: { recipientId: string; senderId: string; matchKey: string }): Promise<boolean> {
  const sql = getDb()
  if (!sql) return false
  const throttled = await sql<{ user_id: string }[]>`
    INSERT INTO push_throttle (user_id, key, sent_at)
    VALUES (${input.recipientId}, ${`msg:${input.matchKey}`}, now())
    ON CONFLICT (user_id, key) DO UPDATE SET sent_at = now()
      WHERE push_throttle.sent_at < now() - (${MESSAGE_PUSH_THROTTLE_SECONDS} || ' seconds')::interval
    RETURNING user_id
  `
  if (throttled.length === 0) return false
  const [sender] = await sql<{ name: string | null }[]>`SELECT name FROM users WHERE id = ${input.senderId}`
  await pushToUser({ userId: input.recipientId, kind: "message", peerUserId: input.senderId, peerName: sender?.name ?? null })
  return true
}
