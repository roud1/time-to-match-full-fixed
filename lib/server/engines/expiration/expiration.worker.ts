import { expireDueMatches } from "@/lib/server/match-engine/repository"
import { onMatchGhosted, recomputeUserBehavior } from "@/lib/server/engines/behavior/behavior.service"
import { processMatchUrgency } from "@/lib/server/engines/expiration/expiration.service"
import { getDb } from "@/lib/server/db"
import { log } from "@/lib/server/log"

export type EnginesCronResult = {
  urgency: Awaited<ReturnType<typeof processMatchUrgency>>
  expired: Awaited<ReturnType<typeof expireDueMatches>>
  ghostsPenalized: number
}

/**
 * Master worker — run every minute:
 * 1) urgency ladder (6h visibility / 12h warning / critical)
 * 2) hard expire at 24h
 * 3) behavior penalties for ghosts
 */
export async function runEnginesCron(): Promise<EnginesCronResult> {
  const urgency = await processMatchUrgency()
  const expired = await expireDueMatches()

  let ghostsPenalized = 0
  const db = getDb()

  if (db && expired.matchIds.length > 0) {
    const ghosts = await db<{ id: string; non_responder_id: string | null }[]>`
      SELECT id, non_responder_id
      FROM matches
      WHERE id = ANY(${expired.matchIds})
        AND non_responder_id IS NOT NULL
    `

    for (const row of ghosts) {
      if (!row.non_responder_id) continue
      await onMatchGhosted({ ghostUserId: row.non_responder_id, matchId: row.id })
      ghostsPenalized += 1
    }

    const userIds = new Set<string>()
    for (const row of ghosts) {
      if (row.non_responder_id) userIds.add(row.non_responder_id)
    }
    await Promise.all([...userIds].map((id) => recomputeUserBehavior(id)))
  }

  if (expired.expiredCount > 0 || urgency.warnings > 0) {
    log.info("engines_cron_done", {
      expired: expired.expiredCount,
      urgency,
      ghostsPenalized,
    })
  }

  return { urgency, expired, ghostsPenalized }
}
