import {
  BOOST_DURATION_HOURS,
  BOOST_SCORE_MULTIPLIER,
} from "@/server/monetization/constants"
import { getBoostExpiresAt, setBoostExpiresAt } from "@/server/monetization/repository"
import type { BoostStatus } from "@/server/monetization/types"

export async function isBoostActive(userId: string): Promise<boolean> {
  const expiresAt = await getBoostExpiresAt(userId)
  return Boolean(expiresAt && expiresAt.getTime() > Date.now())
}

export async function getBoostStatus(userId: string): Promise<BoostStatus> {
  const expiresAt = await getBoostExpiresAt(userId)
  const active = Boolean(expiresAt && expiresAt.getTime() > Date.now())
  return {
    active,
    expiresAt: active && expiresAt ? expiresAt.toISOString() : null,
    multiplier: active ? BOOST_SCORE_MULTIPLIER : 1,
  }
}

export function getBoostMultiplier(active: boolean): number {
  return active ? BOOST_SCORE_MULTIPLIER : 1
}

export async function activateBoost(userId: string, durationHours = BOOST_DURATION_HOURS): Promise<BoostStatus> {
  const current = await getBoostExpiresAt(userId)
  const now = Date.now()
  const base = current && current.getTime() > now ? current.getTime() : now
  const expiresAt = new Date(base + durationHours * 60 * 60 * 1000)
  await setBoostExpiresAt(userId, expiresAt)
  return {
    active: true,
    expiresAt: expiresAt.toISOString(),
    multiplier: BOOST_SCORE_MULTIPLIER,
  }
}
