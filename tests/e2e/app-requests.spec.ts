import { test, expect, devices, request as playwrightRequest } from "@playwright/test"
import { createTestUser, registerUserViaApi } from "./helpers/test-user"

/**
 * Speed regressions: the app runs on a small server, so opening the feed must not fire the same
 * request twice, and coming back to the feed must not wait for (or repeat) the session checks.
 */
test.describe("App request budget @db", () => {
  test("feed loads each endpoint once; back from profile it renders without re-checking the mode", async ({
    browser,
  }) => {
    test.setTimeout(120_000)
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"
    const api = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    const ready = (await (await api.get("/api/ready")).json()) as { mode?: string; database?: string }
    test.skip(ready.mode !== "production" || ready.database !== "ok", "Requires Postgres")

    const user = await registerUserViaApi(api, createTestUser("req"))
    const { default: postgres } = await import("postgres")
    const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
    try {
      await sql`UPDATE users SET email_verified = true, gender = 'male',
        profile = COALESCE(profile, '{}'::jsonb) || ${sql.json({
          sensitiveDataConsentAt: new Date().toISOString(),
          lookingFor: "women",
        })}
        WHERE id = ${user.id}`
    } finally {
      await sql.end()
    }

    const phone = devices["Pixel 7"]
    const ctx = await browser.newContext({
      ...phone,
      userAgent: `${phone.userAgent} TTMApp/1`,
      storageState: await api.storageState(),
    })
    const page = await ctx.newPage()
    const calls: string[] = []
    page.on("request", (r) => {
      const u = new URL(r.url())
      if (u.pathname.startsWith("/api/")) calls.push(`${r.method()} ${u.pathname}`)
    })
    const count = (name: string) => calls.filter((c) => c === name).length

    await page.goto("/app")
    await expect(page.locator(".ttm-app-dock")).toBeVisible({ timeout: 30_000 })
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1500)
    for (const name of ["GET /api/ready", "GET /api/me", "GET /api/subscription", "GET /api/discover", "GET /api/likes/incoming"]) {
      expect(count(name), `${name} on first load (${calls.join(", ")})`).toBeLessThanOrEqual(1)
    }

    await page.locator('.ttm-app-dock a[href="/profile"]').click()
    await page.waitForURL(/\/profile$/)
    await page.waitForLoadState("networkidle")

    calls.length = 0
    await page.locator('.ttm-app-dock a[href="/app"]').click()
    await page.waitForURL(/\/app$/)
    await expect(page.locator(".ttm-app-dock")).toBeVisible()
    await page.waitForLoadState("networkidle")
    expect(count("GET /api/ready"), calls.join(", ")).toBe(0)
    expect(count("GET /api/me"), calls.join(", ")).toBeLessThanOrEqual(1)
    expect(count("GET /api/discover"), calls.join(", ")).toBeLessThanOrEqual(1)

    await ctx.close()
    await api.dispose()
  })
})
