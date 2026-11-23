import { getDb } from "@/server/db"

/**
 * True only when both users opted in to AI connection insights (profile.aiInsightsConsent).
 * Chat transcripts contain both people's messages, so one person's consent is not enough.
 */
export async function bothConsentToAiInsights(userA: string, userB: string): Promise<boolean> {
  if (!userA || !userB || userA === userB) return false
  const db = getDb()
  if (!db) return false
  try {
    const rows = await db<{ n: number }[]>`
      SELECT count(*)::int AS n FROM users
      WHERE id IN (${userA}, ${userB}) AND profile->>'aiInsightsConsent' = 'true'
    `
    return rows[0]?.n === 2
  } catch {
    return false
  }
}
