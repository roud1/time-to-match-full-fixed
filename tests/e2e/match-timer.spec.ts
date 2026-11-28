import { test, expect, request as playwrightRequest, type APIRequestContext } from "@playwright/test"
import { createTestUser, markEmailVerified, registerUserViaApi } from "./helpers/test-user"

/**
 * The 24-hour connection timer between two real accounts:
 *  - a new match expires in ~24 h, the same moment for both people;
 *  - every 5 messages from a person add +6 h to the pair (at most once per hour);
 *  - an expired match accepts no more messages.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"
const H = 60 * 60 * 1000

async function withDb<T>(fn: (sql: import("postgres").Sql) => Promise<T>): Promise<T> {
  const { default: postgres } = await import("postgres")
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
  try {
    return await fn(sql)
  } finally {
    await sql.end()
  }
}

type Match = { id: string; expiresAt: string; messagesUntilNext?: number }
async function myMatch(api: APIRequestContext): Promise<Match> {
  const body = (await (await api.get("/api/matches")).json()) as { matches: Match[] }
  expect(body.matches.length).toBe(1)
  return body.matches[0]
}

test.describe("Connection timer @db", () => {
  test("24 h, +6 h every 5 messages with a 1 h cooldown, expired match is closed", async () => {
    test.setTimeout(90_000)
    const ctx = () => playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    const a = await ctx()
    const b = await ctx()
    const ready = (await (await a.get("/api/ready")).json()) as { mode?: string; database?: string }
    test.skip(ready.mode !== "production" || ready.database !== "ok", "Requires Postgres")
    const ua = await registerUserViaApi(a, createTestUser("tm-a"))
    const ub = await registerUserViaApi(b, createTestUser("tm-b"))
    await markEmailVerified(ua.email)
    await markEmailVerified(ub.email)
    try {
      expect((await a.post("/api/discover/like", { data: { targetUserId: ub.id } })).ok()).toBeTruthy()
      expect((await b.post("/api/discover/like", { data: { targetUserId: ua.id } })).ok()).toBeTruthy()

      const ma = await myMatch(a)
      const mb = await myMatch(b)
      const left = Date.parse(ma.expiresAt) - Date.now()
      expect(left).toBeGreaterThan(23.5 * H)
      expect(left).toBeLessThanOrEqual(24 * H + 60_000)
      // Same deadline for both people.
      expect(Math.abs(Date.parse(ma.expiresAt) - Date.parse(mb.expiresAt))).toBeLessThan(5_000)

      // 5 messages from A → +6 h for the pair.
      let last: { prolonged?: boolean } = {}
      for (let i = 1; i <= 5; i++) {
        const res = await a.post(`/api/matches/${ma.id}/message`, { data: { text: `hello ${i}` } })
        expect(res.ok(), await res.text()).toBeTruthy()
        last = ((await res.json()) as { bond?: { prolonged?: boolean } }).bond ?? {}
        if (i < 5) expect(last.prolonged).toBeFalsy()
      }
      expect(last.prolonged).toBe(true)
      const after = await myMatch(a)
      const added = Date.parse(after.expiresAt) - Date.parse(ma.expiresAt)
      expect(added).toBeGreaterThan(5.9 * H)
      expect(added).toBeLessThan(6.1 * H)
      expect(Math.abs(Date.parse((await myMatch(b)).expiresAt) - Date.parse(after.expiresAt))).toBeLessThan(5_000)

      // Within the hour: 5 more messages do not extend again.
      for (let i = 6; i <= 10; i++) {
        const res = await a.post(`/api/matches/${ma.id}/message`, { data: { text: `hello ${i}` } })
        expect(((await res.json()) as { bond?: { prolonged?: boolean } }).bond?.prolonged).toBeFalsy()
      }
      expect((await myMatch(a)).expiresAt).toBe(after.expiresAt)

      // Expired: no more messages.
      await withDb(async (sql) => {
        await sql`UPDATE likes SET expires_at = now() - interval '1 minute' WHERE (from_user = ${ua.id} AND to_user = ${ub.id}) OR (from_user = ${ub.id} AND to_user = ${ua.id})`
        await sql`UPDATE matches SET expires_at = now() - interval '1 minute' WHERE (user1_id = ${ua.id} AND user2_id = ${ub.id}) OR (user1_id = ${ub.id} AND user2_id = ${ua.id})`
      })
      const late = await b.post(`/api/matches/${mb.id}/message`, { data: { text: "too late" } })
      expect(late.ok()).toBe(false)
    } finally {
      await withDb((sql) => sql`DELETE FROM users WHERE id IN ${sql([ua.id, ub.id])}`)
      await a.dispose()
      await b.dispose()
    }
  })
})
