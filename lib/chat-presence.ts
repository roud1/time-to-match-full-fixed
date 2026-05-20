import type { ChatThread } from "@/lib/social-store"
import { presenceFromProfileId } from "@/components/activity/presence-badge"
import { isPulseProfile } from "@/lib/pulse-companion"

const ACTIVE_MS = 30 * 60 * 1000

/** Demo: peer is "online" in chat if marked online or recently messaged. */
export function isChatPeerOnline(profileId: number, thread: ChatThread): boolean {
  if (isPulseProfile(profileId)) return true
  if (presenceFromProfileId(profileId) === "online") return true

  const lastThem = [...thread.messages].reverse().find((m) => m.from === "them")
  if (!lastThem) return false

  return Date.now() - lastThem.at < ACTIVE_MS
}
