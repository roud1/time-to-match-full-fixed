import { test, expect, request as playwrightRequest } from "@playwright/test"
import { createTestUser, markEmailVerified, registerUserViaApi } from "./helpers/test-user"

/**
 * One source of truth for the plan: the profile (/api/subscription) and the settings card
 * (/api/billing/subscription) must agree for a free user, a granted Premium and an admin.
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

test.describe("Subscription status consistency @db", () => {
  test("profile and settings report the same plan", async () => {
    const ctx = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    const ready = (await (await ctx.get("/api/ready")).json()) as { mode?: string; database?: string }
    test.skip(ready.mode !== "production" || ready.database !== "ok", "Requires Postgres")
    const user = await registerUserViaApi(ctx, createTestUser("subc"))
    await markEmailVerified(user.email)
    const read = async () => ({
      profile: (await (await ctx.get("/api/subscription")).json()) as {
        subscription: { isPremium: boolean; tier: string; premiumUntil: string | null; currentPeriodEnd: string | null }
      },
      settings: (await (await ctx.get("/api/billing/subscription")).json()) as {
        plan: string
        currentPeriodEnd: string | null
        manageable: boolean
      },
    })
    try {
      let s = await read()
      expect(s.profile.subscription.isPremium).toBe(false)
      expect(s.settings.plan).toBe("free")

      // Premium granted without Stripe (e.g. restore/promo): both screens say Premium, same date.
      const until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      await withDb(
        (sql) => sql`INSERT INTO user_subscriptions (user_id, plan, status, premium_until)
          VALUES (${user.id}, 'free', 'active', ${until})`
      )
      s = await read()
      expect(s.profile.subscription.isPremium).toBe(true)
      expect(s.settings.plan).toBe("premium")
      expect(s.settings.currentPeriodEnd).toBe(s.profile.subscription.premiumUntil)
      expect(s.settings.manageable).toBe(false)

      // Admin: VIP everywhere, no invented end date.
      await withDb((sql) => sql`UPDATE users SET role = 'admin' WHERE id = ${user.id}`)
      s = await read()
      expect(s.profile.subscription).toMatchObject({ isPremium: true, tier: "vip", premiumUntil: null })
      expect(s.settings.plan).toBe("vip")
      expect(s.settings.currentPeriodEnd).toBeNull()
    } finally {
      await withDb((sql) => sql`DELETE FROM users WHERE id = ${user.id}`)
      await ctx.dispose()
    }
  })
})
