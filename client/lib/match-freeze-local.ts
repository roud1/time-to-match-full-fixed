import { MATCH_FREEZE_COOLDOWN_MS, MATCH_FREEZE_EXTENSION_MS } from "@/client/lib/expiry"
import { freezeConnection } from "@/client/lib/connection-store"
import { hasFreeFreezeAvailable } from "@/client/lib/user/freeze-helpers"
import {
  addLocalFreezeBalance,
  getLocalFreezeBalance,
  getLocalLastFreezeAt,
  setLocalLastFreezeAt,
} from "@/client/lib/user/local-freeze-wallet"
import { getConnection } from "@/client/lib/connection-store"

export type LocalFreezeResult =
  | { ok: true; expiresAt: string; isFrozen: boolean; usedPaid: boolean }
  | { ok: false; code: "no_freezes" | "not_found" | "expired" }

export type LocalFreezeOptions = {
  hasFreeFreeze?: boolean
  freezeBalance?: number
}

export function freezeLocalMatch(
  profileId: number,
  options: LocalFreezeOptions = {}
): LocalFreezeResult {
  const record = getConnection(profileId)
  if (!record) return { ok: false, code: "not_found" }
  if (record.expiresAt <= Date.now()) return { ok: false, code: "expired" }

  const lastFreezeAt = getLocalLastFreezeAt()
  const freeAvailable =
    options.hasFreeFreeze ??
    (hasFreeFreezeAvailable(lastFreezeAt) && !record.isFrozen)
  let balance = options.freezeBalance ?? getLocalFreezeBalance()

  if (!record.isFrozen && freeAvailable) {
    const result = freezeConnection(profileId, MATCH_FREEZE_EXTENSION_MS)
    if (!result.ok) {
      if (result.reason === "frozen") {
        return { ok: false, code: "no_freezes" }
      }
      return { ok: false, code: result.reason === "expired" ? "expired" : "not_found" }
    }
    setLocalLastFreezeAt(new Date().toISOString())
    return {
      ok: true,
      expiresAt: new Date(result.expiresAt).toISOString(),
      isFrozen: true,
      usedPaid: false,
    }
  }

  if (balance > 0) {
    const result = freezeConnection(profileId, MATCH_FREEZE_EXTENSION_MS, {
      allowWhenFrozen: true,
    })
    if (!result.ok) {
      return { ok: false, code: result.reason === "expired" ? "expired" : "not_found" }
    }
    const newBalance = addLocalFreezeBalance(-1)
    void newBalance
    return {
      ok: true,
      expiresAt: new Date(result.expiresAt).toISOString(),
      isFrozen: true,
      usedPaid: true,
    }
  }

  return { ok: false, code: "no_freezes" }
}
