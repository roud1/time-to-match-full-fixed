import { test, expect, devices, request as playwrightRequest } from "@playwright/test"
import { createTestUser, markEmailVerified, registerUserViaApi } from "./helpers/test-user"

/**
 * Unread chats between two real accounts: the dock badge counts conversations whose newest
 * message is from the other person and arrived after the chat was last opened — also for
 * messages this device has not loaded yet, and it stays cleared after the app restarts.
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

function discoverIdToNumeric(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return 200_000 + (Math.abs(h) % 700_000)
}

test.describe("Unread chat badge @db", () => {
  test("appears for new messages, clears when read, survives a restart", async ({ browser }) => {
    test.setTimeout(120_000)
    const ctx = () => playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    const a = await ctx()
    const b = await ctx()
    const ready = (await (await a.get("/api/ready")).json()) as { mode?: string; database?: string }
    test.skip(ready.mode !== "production" || ready.database !== "ok", "Requires Postgres")
    const ua = await registerUserViaApi(a, createTestUser("ur-a"))
    const ub = await registerUserViaApi(b, createTestUser("ur-b"))
    await markEmailVerified(ua.email)
    await markEmailVerified(ub.email)
    await withDb(
      (sql) => sql`UPDATE users SET profile = COALESCE(profile, '{}'::jsonb) || ${sql.json({
        sensitiveDataConsentAt: new Date().toISOString(),
      })} WHERE id IN ${sql([ua.id, ub.id])}`
    )
    try {
      await a.post("/api/discover/like", { data: { targetUserId: ub.id } })
      await b.post("/api/discover/like", { data: { targetUserId: ua.id } })
      const mb = ((await (await b.get("/api/matches")).json()) as { matches: { id: string }[] }).matches[0].id
      await b.post(`/api/matches/${mb}/message`, { data: { text: "Привет!" } })
      await b.post(`/api/matches/${mb}/message`, { data: { text: "Ты тут?" } })

      // The API tells who wrote last.
      const ma = ((await (await a.get("/api/matches")).json()) as {
        matches: { id: string; lastMessageAt: string | null; lastMessageFromPeer: boolean }[]
      }).matches[0]
      expect(ma.lastMessageFromPeer).toBe(true)
      expect(ma.lastMessageAt).not.toBeNull()

      const phone = devices["Pixel 7"]
      const browserCtx = await browser.newContext({
        ...phone,
        userAgent: `${phone.userAgent} TTMApp/1`,
        storageState: await a.storageState(),
        baseURL,
      })
      const page = await browserCtx.newPage()
      const chatBadge = page.locator('.ttm-app-dock a[href="/app?tab=chat"] .ttm-notify-badge')

      // On the feed, before the chat was ever opened on this device.
      await page.goto("/app")
      await expect(chatBadge).toHaveText("1", { timeout: 20_000 })

      // Open the conversation → read → badge gone, also after a restart of the app.
      await page.goto(`/app?tab=chat&with=${discoverIdToNumeric(ub.id)}`)
      await expect(page.getByText("Ты тут?")).toBeVisible({ timeout: 20_000 })
      await page.goto("/app")
      await page.waitForLoadState("networkidle")
      await expect(chatBadge).toHaveCount(0)
      await page.reload()
      await page.waitForLoadState("networkidle")
      await expect(chatBadge).toHaveCount(0)

      // A new message comes back as unread.
      await new Promise((r) => setTimeout(r, 1100))
      await b.post(`/api/matches/${mb}/message`, { data: { text: "Ещё одно" } })
      await page.reload()
      await expect(chatBadge).toHaveText("1", { timeout: 20_000 })
      await browserCtx.close()
    } finally {
      await withDb((sql) => sql`DELETE FROM users WHERE id IN ${sql([ua.id, ub.id])}`)
      await a.dispose()
      await b.dispose()
    }
  })

  test("notification bell: unread count matches the list and clears on read-all", async () => {
    const api = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    const ready = (await (await api.get("/api/ready")).json()) as { mode?: string; database?: string }
    test.skip(ready.mode !== "production" || ready.database !== "ok", "Requires Postgres")
    const u = await registerUserViaApi(api, createTestUser("nb"))
    await markEmailVerified(u.email)
    try {
      await withDb(
        (sql) => sql`INSERT INTO notifications (user_id, type, lead_hours, scheduled_for, sent, sent_at)
          VALUES (${u.id}, 'profile_expiring', 6, now(), true, now()), (${u.id}, 'profile_expiring', 1, now(), true, now()),
                 (${u.id}, 'profile_expiring', 12, now() + interval '1 day', false, NULL)`
      )
      let inbox = (await (await api.get("/api/notifications")).json()) as { notifications: unknown[]; unreadCount: number }
      expect(inbox.unreadCount).toBe(2)
      expect(inbox.notifications).toHaveLength(2)
      expect((await api.post("/api/notifications/read-all")).ok()).toBeTruthy()
      inbox = (await (await api.get("/api/notifications")).json()) as { notifications: unknown[]; unreadCount: number }
      expect(inbox.unreadCount).toBe(0)
      expect(inbox.notifications).toHaveLength(0)
    } finally {
      await withDb((sql) => sql`DELETE FROM users WHERE id = ${u.id}`)
      await api.dispose()
    }
  })
})
