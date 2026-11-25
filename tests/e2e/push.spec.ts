import { test, expect, request as playwrightRequest, type APIRequestContext } from "@playwright/test"
import { createTestUser, markEmailVerified, registerUserViaApi, type RegisteredUser } from "./helpers/test-user"
import { pushLang, pushText } from "../../server/push/push-copy"

/**
 * Instant notifications: device registration, likes / matches handled right away (not by the
 * scheduled job), chat-message pushes throttled per conversation, texts in every language.
 * Actual delivery needs VAPID / Firebase keys and is not part of this suite.
 */

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"

async function requireProductionDb(request: APIRequestContext): Promise<void> {
  const res = await request.get("/api/ready")
  const body = (await res.json()) as { mode?: string; database?: string }
  test.skip(body.mode !== "production" || body.database !== "ok", "Requires Postgres (DATABASE_URL + AUTH_SECRET)")
}

async function withDb<T>(fn: (sql: import("postgres").Sql) => Promise<T>): Promise<T> {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is required")
  const { default: postgres } = await import("postgres")
  const sql = postgres(url, { max: 1 })
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

test.describe("Push texts", () => {
  test("every kind has a text in all 9 languages; likes never name the person", () => {
    for (const lang of ["ru", "uk", "en", "de", "es", "pl", "fr", "it", "tr"]) {
      const l = pushLang(lang)
      expect(l).toBe(lang)
      for (const kind of ["like", "match", "message"] as const) {
        const t = pushText(kind, l, "Anna Smith")
        expect(t.title.length).toBeGreaterThan(0)
        expect(t.body.length).toBeGreaterThan(0)
        expect(t.title + t.body).not.toContain("{name}")
        if (kind === "like") expect(t.title + t.body).not.toContain("Anna")
        else expect(t.title + t.body).toContain("Anna")
        expect(t.title + t.body).not.toContain("Smith") // first name only
      }
    }
    expect(pushLang("pt-BR")).toBe("en")
  })
})

test.describe("Instant notifications @db", () => {
  test.beforeEach(async ({ request }) => {
    await requireProductionDb(request)
  })

  test.afterAll(async () => {
    if (!created.length || !process.env.DATABASE_URL) return
    const ids = created.splice(0)
    await withDb((sql) => sql`DELETE FROM users WHERE id = ANY(${ids}::uuid[])`)
  })

  test("Android device token: register, move between accounts, unregister", async () => {
    const a = await newUser("push-a")
    const b = await newUser("push-b")
    try {
      const token = `test-token-${Date.now()}-abcdefghijklmnop`
      expect((await a.request.post("/api/push/device", { data: { token, platform: "android", locale: "de-DE" } })).status()).toBe(200)
      let rows = await withDb((sql) => sql`SELECT user_id, locale FROM push_devices WHERE token = ${token}`)
      expect(rows[0]).toMatchObject({ user_id: a.user.id, locale: "de" })

      // Same phone, other account signs in: the token follows the current account.
      await b.request.post("/api/push/device", { data: { token } })
      rows = await withDb((sql) => sql`SELECT user_id FROM push_devices WHERE token = ${token}`)
      expect(rows[0].user_id).toBe(b.user.id)

      // A user cannot remove someone else's device.
      await a.request.delete("/api/push/device", { data: { token } })
      expect((await withDb((sql) => sql`SELECT count(*)::int AS n FROM push_devices WHERE token = ${token}`))[0].n).toBe(1)
      await b.request.delete("/api/push/device", { data: { token } })
      expect((await withDb((sql) => sql`SELECT count(*)::int AS n FROM push_devices WHERE token = ${token}`))[0].n).toBe(0)

      expect((await a.request.post("/api/push/device", { data: { token: "short" } })).status()).toBe(400)
      const anon = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
      expect((await anon.post("/api/push/device", { data: { token } })).status()).toBe(401)
      await anon.dispose()
    } finally {
      await a.request.dispose()
      await b.request.dispose()
    }
  })

  test("likes and matches are handled instantly; chat pushes are throttled per conversation", async () => {
    const a = await newUser("push-a")
    const b = await newUser("push-b")
    try {
      expect((await a.request.post("/api/discover/like", { data: { targetUserId: b.user.id } })).ok()).toBeTruthy()
      // The "someone liked you" row exists for the inbox and is already sent (no waiting for the job).
      const liked = await withDb(
        (sql) => sql`SELECT sent FROM notifications WHERE user_id = ${b.user.id} AND type = 'someone_liked_you'`
      )
      expect(liked).toHaveLength(1)
      expect(liked[0].sent).toBe(true)

      const match = await (await b.request.post("/api/discover/like", { data: { targetUserId: a.user.id } })).json()
      expect(match.matched).toBe(true)
      const matchRows = await withDb(
        (sql) => sql`SELECT user_id, sent FROM notifications WHERE type = 'new_match' AND user_id IN (${a.user.id}, ${b.user.id})`
      )
      expect(matchRows).toHaveLength(2)
      expect(matchRows.every((r) => r.sent === true)).toBe(true)

      // Each person addresses the conversation by the id from their own match list.
      const list = (await (await a.request.get("/api/matches")).json()) as { matches: Array<{ id: string; peerUserId: string }> }
      const aMatchId = list.matches.find((m) => m.peerUserId === b.user.id)!.id
      const send = (ctx: APIRequestContext, text: string) => ctx.post(`/api/matches/${aMatchId}/message`, { data: { text } })
      const firstSend = await send(a.request, "Hi!")
      expect(firstSend.ok(), await firstSend.text()).toBeTruthy()
      await expect
        .poll(async () => (await withDb((sql) => sql`SELECT sent_at FROM push_throttle WHERE user_id = ${b.user.id}`)).length)
        .toBe(1)
      const first = (await withDb((sql) => sql`SELECT sent_at FROM push_throttle WHERE user_id = ${b.user.id}`))[0].sent_at
      // A second message right away does not send another push.
      expect((await send(a.request, "Are you there?")).ok()).toBeTruthy()
      await new Promise((r) => setTimeout(r, 500))
      const second = (await withDb((sql) => sql`SELECT sent_at FROM push_throttle WHERE user_id = ${b.user.id}`))[0].sent_at
      expect(new Date(second).getTime()).toBe(new Date(first).getTime())
      // The sender gets nothing for their own messages.
      expect((await withDb((sql) => sql`SELECT count(*)::int AS n FROM push_throttle WHERE user_id = ${a.user.id}`))[0].n).toBe(0)
    } finally {
      await a.request.dispose()
      await b.request.dispose()
    }
  })
})
