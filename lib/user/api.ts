import type { BuyFreezesResponse, MeResponse } from "@/lib/user/types"
import type { DatingPurpose } from "@/lib/interests/types"
import type { FreezePackageId } from "@/lib/freeze-packages"
import {
  applyServerUserToLocalProfile,
  getUserProfile,
  isLoggedIn,
  setSession,
} from "@/lib/user-profile"
import {
  addLocalFreezeBalance,
  getLocalFreezeBalance,
  getLocalLastFreezeAt,
} from "@/lib/user/local-freeze-wallet"
import { getFreezePackage } from "@/lib/freeze-packages"
import { getAppMode } from "@/lib/auth/client"

function syncLocalFromServerUser(user: MeResponse["user"]): void {
  applyServerUserToLocalProfile({
    name: user.name,
    email: user.email,
    purpose: (user.purpose ?? undefined) as DatingPurpose | undefined,
    ageMin: user.ageMin,
    ageMax: user.ageMax,
    maxDistance: user.maxDistance,
    dbInterestIds: user.interestIds,
  })
  if (!isLoggedIn()) setSession(user.email, true)
}

export async function fetchMe(): Promise<MeResponse["user"] | null> {
  try {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 8_000)
    const res = await fetch("/api/me", {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
    window.clearTimeout(timeoutId)

    if (res.ok) {
      const data = (await res.json()) as MeResponse
      syncLocalFromServerUser(data.user)
      return data.user
    }

    if (res.status === 401) return null

    if (res.status !== 503) {
      const mode = await getAppMode()
      if (mode === "production") return null
    }
  } catch {
    const mode = await getAppMode().catch(() => "demo" as const)
    if (mode === "production") return null
  }

  if (!isLoggedIn()) return null
  const profile = getUserProfile()
  if (!profile) return null

  return {
    id: "local",
    email: profile.email,
    name: profile.name,
    freeze_balance: getLocalFreezeBalance(),
    last_freeze_at: getLocalLastFreezeAt(),
    email_verified: true,
    has_push_subscription: false,
  }
}

export async function buyFreezes(
  packageId: FreezePackageId
): Promise<{ ok: true; newBalance: number } | { ok: false; message?: string }> {
  const pack = getFreezePackage(packageId)
  if (!pack) return { ok: false, message: "Unknown package" }

  try {
    const res = await fetch("/api/purchases/buy-freezes", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    })
    const body = (await res.json()) as BuyFreezesResponse & { message?: string; error?: string }
    if (res.ok && body.success) {
      return { ok: true, newBalance: body.newBalance }
    }
    if (res.status === 401 || res.status === 503) {
      const newBalance = addLocalFreezeBalance(pack.count)
      return { ok: true, newBalance }
    }
    return { ok: false, message: body.message ?? "Purchase failed" }
  } catch {
    const newBalance = addLocalFreezeBalance(pack.count)
    return { ok: true, newBalance }
  }
}
