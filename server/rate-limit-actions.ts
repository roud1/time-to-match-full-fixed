import { checkRateLimit } from "@/server/rate-limit"

/** Per-user swipe / social action cap — simple anti-fraud. */
const ACTIONS_PER_MINUTE = 30

export async function checkUserActionRate(userId: string): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const rl = await checkRateLimit(`user-actions:${userId}`, ACTIONS_PER_MINUTE, 60_000)
  if (rl.ok) return { ok: true }
  return { ok: false, retryAfterSec: rl.retryAfterSec }
}
