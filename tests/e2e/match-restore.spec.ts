import { test, expect, request as playwrightRequest, type APIRequestContext } from "@playwright/test"
import { createTestUser, markEmailVerified, registerUserViaApi, type RegisteredUser } from "./helpers/test-user"

/** Expired matches: restore (Premium), unmatch stays closed, admin matches never expire. */

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"

async function requireProductionDb(request: APIRequestContext): Promise<void> {
  const res = await request.get("/api/ready")
  const body = (await res.json()) as { mode?: string; database?: string }
  test.skip(body.mode !== "production" || body.database !== "ok", "Requires Postgres")
}

async function withDb<T>(fn: (sql: import("postgres").Sql) => Promise<T>): Promise<T> {
  const { default: postgres } = await import("postgres")
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
  try {
    return await fn(sql)
  } finally {
    await sql.end()
  }
}

const created: string[] = []
async function newUser(prefix: string): Promise<{ request: APIRequestContext; user: RegisteredUser }> {
  const request = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
  const user = await registerUserViaApi(request, createTestUser(prefix))
  created.push(user.id)
  await markEmailVerified(user.email)
  return { request, user }
}

async function matchPair(a: { request: APIRequestContext; user: RegisteredUser }, b: { request: APIRequestContext; user: RegisteredUser }) {
  await a.request.post("/api/discover/like", { data: { targetUserId: b.user.id } })
  await b.request.post("/api/discover/like", { data: { targetUserId: a.user.id } })
  // The engine match id (matches.id) behind the pair's likes.
  const [row] = await withDb(
    (sql) => sql`SELECT match_id FROM likes WHERE from_user = ${a.user.id} AND to_user = ${b.user.id}`
  )
  return row.match_id as string
}

/** Simulates the scheduled job: the match ran out of time. */
async function expireByTime(matchId: string) {
  await withDb(async (sql) => {
    await sql`UPDATE matches SET expires_at = now() - interval '2 minutes', status = 'expired', expired_at = now() - interval '1 minute' WHERE id = ${matchId}`
    await sql`UPDATE likes SET is_expired = true, expires_at = now() - interval '2 minutes' WHERE match_id = ${matchId}`
  })
}

test.describe("Expired matches @db", () => {
  test.beforeEach(async ({ request }) => requireProductionDb(request))
  test.afterAll(async () => {
    if (!created.length || !process.env.DATABASE_URL) return
    const ids = created.splice(0)
    await withDb((sql) => sql`DELETE FROM users WHERE id = ANY(${ids}::uuid[])`)
  })

  test("a match that ran out of time can be restored with Premium; the peer sees it again", async () => {
    const a = await newUser("rst-a")
    const b = await newUser("rst-b")
    try {
      const matchId = await matchPair(a, b)
      await expireByTime(matchId)
      const peerList = async () => ((await (await b.request.get("/api/matches")).json()) as { matches: Array<{ peerUserId: string }> }).matches
      expect((await peerList()).some((m) => m.peerUserId === a.user.id)).toBe(false)

      const restorable = await (await a.request.get("/api/matches/restorable")).json()
      expect(restorable.matches).toEqual([expect.objectContaining({ matchId, peerUserId: b.user.id })])

      // Free account → Premium needed.
      expect((await a.request.post(`/api/matches/${matchId}/restore`)).status()).toBe(402)

      await withDb((sql) => sql`INSERT INTO user_subscriptions (user_id, plan, status, current_period_end) VALUES (${a.user.id}, 'premium', 'active', now() + interval '30 days')`)
      const ok = await a.request.post(`/api/matches/${matchId}/restore`)
      expect(ok.status()).toBe(200)
      const hours = (Date.parse((await ok.json()).expiresAt) - Date.now()) / 3_600_000
      expect(hours).toBeGreaterThan(23)
      expect(hours).toBeLessThan(25)
      expect((await peerList()).some((m) => m.peerUserId === a.user.id)).toBe(true)
      expect((await (await a.request.get("/api/matches/restorable")).json()).matches).toEqual([])
    } finally {
      await a.request.dispose()
      await b.request.dispose()
    }
  })

  test("a match someone closed (unmatch) cannot be restored", async () => {
    const a = await newUser("rst-a")
    const b = await newUser("rst-b")
    try {
      const matchId = await matchPair(a, b)
      // Closed early: expired before its deadline.
      await withDb((sql) => sql`UPDATE matches SET status = 'expired', expired_at = now() WHERE id = ${matchId}`)
      await withDb((sql) => sql`UPDATE users SET role = 'admin' WHERE id = ${a.user.id}`)
      expect((await (await a.request.get("/api/matches/restorable")).json()).matches).toEqual([])
      expect((await a.request.post(`/api/matches/${matchId}/restore`)).status()).toBe(404)
    } finally {
      await a.request.dispose()
      await b.request.dispose()
    }
  })

  test("admin accounts: matches do not expire", async () => {
    const a = await newUser("rst-a")
    const b = await newUser("rst-b")
    try {
      await withDb((sql) => sql`UPDATE users SET role = 'admin' WHERE id = ${a.user.id}`)
      const matchId = await matchPair(a, b)
      const [row] = await withDb((sql) => sql`SELECT expires_at FROM matches WHERE id = ${matchId}`)
      expect(new Date(row.expires_at).getTime() - Date.now()).toBeGreaterThan(365 * 24 * 3_600_000)
      // Even an old deadline is pushed out when the admin opens the list.
      await withDb((sql) => sql`UPDATE matches SET expires_at = now() + interval '1 hour' WHERE id = ${matchId}`)
      await a.request.get("/api/matches")
      const [after] = await withDb((sql) => sql`SELECT expires_at, status FROM matches WHERE id = ${matchId}`)
      expect(new Date(after.expires_at).getTime() - Date.now()).toBeGreaterThan(365 * 24 * 3_600_000)
    } finally {
      await a.request.dispose()
      await b.request.dispose()
    }
  })
})
