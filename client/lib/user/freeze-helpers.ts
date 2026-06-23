import { MATCH_FREEZE_COOLDOWN_MS } from "@/client/lib/expiry"

export function hasFreeFreezeAvailable(lastFreezeAt: string | null | undefined): boolean {
  if (!lastFreezeAt) return true
  const last = new Date(lastFreezeAt).getTime()
  if (!Number.isFinite(last)) return true
  return Date.now() - last >= MATCH_FREEZE_COOLDOWN_MS
}
