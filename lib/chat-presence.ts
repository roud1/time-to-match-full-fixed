import type { ChatThread } from "@/lib/social-store"
import { demoPeerPresence } from "@/lib/profile-life"
import { isPulseProfile } from "@/lib/pulse-companion"

/** Whether the peer appears online in chat header. */
export function isChatPeerOnline(profileId: number, _thread: ChatThread): boolean {
  if (isPulseProfile(profileId)) return true
  const presence = demoPeerPresence(profileId)
  return presence === "active" || presence === "recent"
}
