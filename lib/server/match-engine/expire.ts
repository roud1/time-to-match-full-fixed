import { expireDueMatches } from "@/lib/server/match-engine/repository"
import { log } from "@/lib/server/log"
import type { ExpireMatchesResult } from "@/lib/server/match-engine/types"

/** Run every minute via cron — marks due matches as expired (server clock). */
export async function runMatchExpiryCron(): Promise<ExpireMatchesResult> {
  const result = await expireDueMatches()
  if (result.expiredCount > 0) {
    log.info("match_engine_expired", {
      count: result.expiredCount,
      matchIds: result.matchIds.slice(0, 20),
    })
  }
  return result
}
