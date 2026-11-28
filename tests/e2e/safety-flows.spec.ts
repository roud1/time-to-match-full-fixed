import { test, expect, request as playwrightRequest, type APIRequestContext } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import { createTestUser, markEmailVerified, registerUserViaApi } from "./helpers/test-user"

/** Block, report, photo verification and account deletion between real accounts. */
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

async function pair(prefix: string) {
  const ctx = () => playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
  const a = await ctx()
  const b = await ctx()
  const ua = await registerUserViaApi(a, createTestUser(`${prefix}-a`))
  const ub = await registerUserViaApi(b, createTestUser(`${prefix}-b`))
  await markEmailVerified(ua.email)
  await markEmailVerified(ub.email)
  await withDb(
    (sql) => sql`UPDATE users SET profile = COALESCE(profile, '{}'::jsonb) || ${sql.json({
      photoUrls: ["/demo/people/demo-3.jpg"],
    })} WHERE id IN ${sql([ua.id, ub.id])}`
  )
  return { a, b, ua, ub }
}

async function discoverIds(api: APIRequestContext): Promise<string[]> {
  const body = (await (await api.get("/api/discover?limit=120&maxDistance=500")).json()) as { profiles: { id: string }[] }
  return body.profiles.map((p) => p.id)
}

test.describe("Safety flows @db", () => {
  test.beforeEach(async ({ request }) => {
    const ready = (await (await request.get("/api/ready")).json()) as { mode?: string; database?: string }
    test.skip(ready.mode !== "production" || ready.database !== "ok", "Requires Postgres")
  })

  test("block: hides both ways and closes the match; report reaches the admin queue only", async () => {
    const { a, b, ua, ub } = await pair("sf-block")
    try {
      expect(await discoverIds(a)).toContain(ub.id)
      await a.post("/api/discover/like", { data: { targetUserId: ub.id } })
      await b.post("/api/discover/like", { data: { targetUserId: ua.id } })
      const mb = ((await (await b.get("/api/matches")).json()) as { matches: { id: string }[] }).matches[0].id

      // Report, then block.
      const report = await a.post("/api/v1/report", { data: { reportedUserId: ub.id, reasonKey: "spam", comment: "test" } })
      expect(report.ok(), await report.text()).toBeTruthy()
      expect((await a.post("/api/v1/block", { data: { blockedUserId: ub.id, action: "block" } })).ok()).toBeTruthy()

      expect(await discoverIds(a)).not.toContain(ub.id)
      expect(await discoverIds(b)).not.toContain(ua.id)
      expect(((await (await b.get("/api/matches")).json()) as { matches: unknown[] }).matches).toHaveLength(0)
      expect((await b.post(`/api/matches/${mb}/message`, { data: { text: "hi?" } })).ok()).toBe(false)

      // The report is visible to an admin, not to regular users.
      expect((await a.get("/api/admin/reports")).ok()).toBe(false)
      await withDb((sql) => sql`UPDATE users SET role = 'admin' WHERE id = ${ua.id}`)
      const queue = (await (await a.get("/api/admin/reports")).json()) as { reports: { reportedUserId?: string; reported_id?: string }[] }
      expect(JSON.stringify(queue)).toContain(ub.id)
    } finally {
      await withDb((sql) => sql`DELETE FROM users WHERE id IN ${sql([ua.id, ub.id])}`)
      await a.dispose()
      await b.dispose()
    }
  })

  test("photo verification: selfie is private, admin approves, user becomes verified", async () => {
    const { a: user, b: admin, ua, ub } = await pair("sf-verify")
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "verification")
    const before = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0
    try {
      const { default: sharp } = await import("sharp")
      const selfie = await sharp({ create: { width: 1200, height: 1600, channels: 3, background: "#c08" } }).jpeg().toBuffer()
      const submit = await user.post("/api/verification/submit", {
        multipart: { gesture: "peace", selfie: { name: "me.jpg", mimeType: "image/jpeg", buffer: selfie } },
      })
      expect(submit.ok(), await submit.text()).toBeTruthy()
      const reqId = ((await submit.json()) as { request: { id: string; selfieUrl: string } }).request
      expect(reqId.selfieUrl).toBe(`/api/admin/verification/${reqId.id}/selfie`)
      // Nothing written to the public folder; the selfie is not reachable for others.
      expect(fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0).toBe(before)
      expect((await user.get(reqId.selfieUrl)).status()).toBe(403)
      const anon = await playwrightRequest.newContext({ baseURL })
      expect((await anon.get(reqId.selfieUrl)).status()).not.toBe(200)
      await anon.dispose()

      await withDb((sql) => sql`UPDATE users SET role = 'admin' WHERE id = ${ub.id}`)
      const list = (await (await admin.get("/api/admin/verification")).json()) as { requests: { id: string }[] }
      expect(list.requests.map((r) => r.id)).toContain(reqId.id)
      const img = await admin.get(reqId.selfieUrl)
      expect(img.status()).toBe(200)
      expect(img.headers()["content-type"]).toBe("image/jpeg")
      expect(img.headers()["cache-control"]).toContain("no-store")

      const approve = await admin.put(`/api/admin/verification/${reqId.id}`, { data: { status: "approved" } })
      expect(approve.ok(), await approve.text()).toBeTruthy()
      const status = (await (await user.get("/api/verification/status")).json()) as { verified: boolean }
      expect(status.verified).toBe(true)
    } finally {
      await withDb((sql) => sql`DELETE FROM users WHERE id IN ${sql([ua.id, ub.id])}`)
      await user.dispose()
      await admin.dispose()
    }
  })

  test("account deletion needs the password and removes the account", async () => {
    const api = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    const creds = createTestUser("sf-del")
    const u = await registerUserViaApi(api, creds)
    await markEmailVerified(u.email)
    const wrong = await api.delete("/api/me", { data: { password: "wrong-password" } })
    expect(wrong.status()).toBe(403)
    const ok = await api.delete("/api/me", { data: { password: creds.password } })
    expect(ok.ok(), await ok.text()).toBeTruthy()
    const [{ n }] = await withDb((sql) => sql<{ n: number }[]>`SELECT count(*)::int AS n FROM users WHERE id = ${u.id}`)
    expect(n).toBe(0)
    const fresh = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    const login = await fresh.post("/api/v1/auth/login", { data: { email: creds.email, password: creds.password } })
    expect(login.ok()).toBe(false)
    await fresh.dispose()
    await api.dispose()
  })
})
