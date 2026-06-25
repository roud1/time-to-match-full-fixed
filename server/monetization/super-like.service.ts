import {
  PREMIUM_SUPER_LIKES_PER_DAY,
  VIP_SUPER_LIKES_PER_DAY,
} from "@/server/monetization/constants"
import {
  getDailySuperLikesUsed,
  incrementDailySuperLikes,
} from "@/server/monetization/repository"
import { getSubscription, isPremium, isVip } from "@/server/monetization/subscription.service"

export class SuperLikeLimitError extends Error {
  readonly code = "SUPER_LIKE_LIMIT_REACHED" as const

  constructor(public readonly remaining: number) {
    super("Daily super like limit reached")
    this.name = "SuperLikeLimitError"
  }
}

async function superLikeDailyLimit(userId: string): Promise<number> {
  if (await isVip(userId)) return VIP_SUPER_LIKES_PER_DAY
  if (await isPremium(userId)) return PREMIUM_SUPER_LIKES_PER_DAY
  return 0
}

export async function canUserSuperLike(userId: string): Promise<{
  allowed: boolean
  remaining: number
  dailyLimit: number
}> {
  const dailyLimit = await superLikeDailyLimit(userId)
  if (dailyLimit <= 0) {
    return { allowed: false, remaining: 0, dailyLimit: 0 }
  }

  const used = await getDailySuperLikesUsed(userId, utcDateKey())
  const remaining = Math.max(0, dailyLimit - used)
  return { allowed: remaining > 0, remaining, dailyLimit }
}

export async function consumeSuperLike(userId: string): Promise<void> {
  const check = await canUserSuperLike(userId)
  if (!check.allowed) {
    throw new SuperLikeLimitError(check.remaining)
  }
  await incrementDailySuperLikes(userId, utcDateKey())
}

function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export async function getSuperLikeLimits(userId: string) {
  const sub = await getSubscription(userId)
  const dailyLimit = await superLikeDailyLimit(userId)
  const usedToday = await getDailySuperLikesUsed(userId, utcDateKey())
  return {
    tier: sub.tier,
    dailyLimit,
    usedToday,
    remaining: Math.max(0, dailyLimit - usedToday),
  }
}
