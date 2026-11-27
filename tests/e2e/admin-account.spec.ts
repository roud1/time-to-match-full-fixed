import { test, expect, request as playwrightRequest, type APIRequestContext } from "@playwright/test"
import { createTestUser, markEmailVerified, registerUserViaApi } from "./helpers/test-user"

/** Admin rights by account (users.role / ADMIN_EMAILS) — no admin key needed. */

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

test.describe("Admin account @db", () => {
  test.beforeEach(async ({ request }) => requireProductionDb(request))

  test("regular users are not admins; an admin account opens the moderation API without a key", async () => {
    const ctx = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    const user = await registerUserViaApi(ctx, createTestUser("adm"))
    try {
      await markEmailVerified(user.email)
      expect(await (await ctx.get("/api/admin/session")).json()).toEqual({ admin: false })
      expect((await ctx.get("/api/admin/reports")).ok()).toBe(false)

      await withDb((sql) => sql`UPDATE users SET role = 'admin' WHERE id = ${user.id}`)
      expect(await (await ctx.get("/api/admin/session")).json()).toEqual({ admin: true })
      const reports = await ctx.get("/api/admin/reports")
      expect(reports.status()).toBe(200)
    } finally {
      await withDb((sql) => sql`DELETE FROM users WHERE id = ${user.id}`)
      await ctx.dispose()
    }
  })
})
