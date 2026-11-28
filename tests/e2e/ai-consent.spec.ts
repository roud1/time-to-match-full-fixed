import { test, expect, request as playwrightRequest } from "@playwright/test"
import { createTestUser, markEmailVerified, registerUserViaApi } from "./helpers/test-user"

/**
 * Luvia AI and private messages: nothing about a conversation is analysed or shown unless BOTH
 * people turned on AI tips; turning it off deletes what was derived from their conversations.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"

async function withDb<T>(fn: (sql: import("postgres").Sql) => Promise<T>): Promise<T> {
  const { default: postgres } = await import("postgres")
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
  try {
    return await fn(sql)
  } finally {
    await sql.end()
  }
}

test.describe("AI consent for conversations @db", () => {
  test("no consent → no analysis; both → visible; withdrawn → deleted", async () => {
    test.setTimeout(90_000)
    const ctx = () => playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    const a = await ctx()
    const b = await ctx()
    const ready = (await (await a.get("/api/ready")).json()) as { mode?: string; database?: string }
    test.skip(ready.mode !== "production" || ready.database !== "ok", "Requires Postgres")
    const ua = await registerUserViaApi(a, createTestUser("aic-a"))
    const ub = await registerUserViaApi(b, createTestUser("aic-b"))
    await markEmailVerified(ua.email)
    await markEmailVerified(ub.email)
    try {
      await a.post("/api/discover/like", { data: { targetUserId: ub.id } })
      await b.post("/api/discover/like", { data: { targetUserId: ua.id } })
      const matchId = ((await (await a.get("/api/matches")).json()) as { matches: { id: string }[] }).matches[0].id
      for (const text of ["Привет", "Как дела?", "Хорошо", "Отлично", "Пока"]) {
        await a.post(`/api/matches/${matchId}/message`, { data: { text } })
      }
      const score = () =>
        a.get(`/api/matches/${matchId}/connection-score`).then((r) => r.json()) as Promise<{
          consent: boolean
          score: unknown
        }>
      const insertScore = () =>
        withDb((sql) => sql`INSERT INTO connection_scores (match_id, message_count, sync, chemistry, bond, energy,
          emotional_state, connection_state, personality, insight, atmosphere_level, source)
          VALUES (${matchId}, 5, 70, 'warm', 'growing', 'steady', 'calm', 'open', 'balanced', 'x', 2, 'openrouter')`)

      // Nobody consented: an existing stored score is not shown.
      await insertScore()
      let s = await score()
      expect(s.consent).toBe(false)
      expect(s.score).toBeNull()

      // The analysis job is not run without consent (the transcript is never read).
      const secret = process.env.CRON_SECRET
      if (secret) {
        await withDb((sql) => sql`INSERT INTO ai_analysis_jobs (match_id, triggered_by, message_count) VALUES (${matchId}, ${ua.id}, 10)`)
        const cron = await a.get("/api/v1/cron/ai-analysis", { headers: { authorization: `Bearer ${secret}` } })
        expect(cron.ok(), await cron.text()).toBeTruthy()
        const [job] = await withDb((sql) => sql<{ status: string; error: string | null }[]>`
          SELECT status, error FROM ai_analysis_jobs WHERE match_id = ${matchId} AND message_count = 10`)
        expect(job).toMatchObject({ status: "failed", error: "no_consent" })
      }

      // Only one person consented: still nothing.
      expect((await a.put("/api/user/profile", { data: { profile: { aiInsightsConsent: true } } })).ok()).toBeTruthy()
      expect((await score()).consent).toBe(false)

      // Both consented: the analysis is visible.
      expect((await b.put("/api/user/profile", { data: { profile: { aiInsightsConsent: true } } })).ok()).toBeTruthy()
      s = await score()
      expect(s.consent).toBe(true)
      expect(s.score).not.toBeNull()

      // Withdrawn by one person: stored analyses of their conversations are deleted.
      expect((await b.put("/api/user/profile", { data: { profile: { aiInsightsConsent: false } } })).ok()).toBeTruthy()
      const [{ n }] = await withDb((sql) => sql<{ n: number }[]>`SELECT count(*)::int AS n FROM connection_scores WHERE match_id = ${matchId}`)
      expect(n).toBe(0)
      s = await score()
      expect(s.consent).toBe(false)
      expect(s.score).toBeNull()
    } finally {
      await withDb((sql) => sql`DELETE FROM users WHERE id IN ${sql([ua.id, ub.id])}`)
      await a.dispose()
      await b.dispose()
    }
  })
})
