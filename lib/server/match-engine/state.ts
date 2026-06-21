import type { MatchStatus } from "@/lib/server/match-engine/types"

export type SenderFlags = {
  user1HasSent: boolean
  user2HasSent: boolean
}

/** Compute next status after a user sends a message (match not expired). */
export function nextStatusAfterSend(
  current: MatchStatus,
  senderIsUser1: boolean,
  flags: SenderFlags
): MatchStatus {
  if (current === "expired") return "expired"

  const u1 = senderIsUser1 ? true : flags.user1HasSent
  const u2 = senderIsUser1 ? flags.user2HasSent : true

  if (u1 && u2) return "active_chat"
  if (u1 || u2) return "waiting_reply"
  return "new_match"
}

export function isMatchLive(status: MatchStatus, expiresAt: Date, now = new Date()): boolean {
  if (status === "expired") return false
  return expiresAt.getTime() > now.getTime()
}
