import { test, expect, devices, request as playwrightRequest } from "@playwright/test"
import { createTestUser, markEmailVerified, registerUserViaApi } from "./helpers/test-user"

/**
 * Back never leaves the installed app: opened straight on an inner screen, the system Back goes
 * to the feed; the in-app back arrow with no in-app history goes to the feed, not to the page
 * the person came from.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"
const OUTSIDE = "data:text/html,<title>outside</title><p>outside</p>"

test.describe("Back navigation @db", () => {
  test("system Back and the back arrow stay inside the app", async ({ browser }) => {
    test.setTimeout(90_000)
    const api = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    const ready = (await (await api.get("/api/ready")).json()) as { mode?: string; database?: string }
    test.skip(ready.mode !== "production" || ready.database !== "ok", "Requires Postgres")
    const user = await registerUserViaApi(api, createTestUser("back"))
    await markEmailVerified(user.email)
    const { default: postgres } = await import("postgres")
    const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
    await sql`UPDATE users SET profile = COALESCE(profile, '{}'::jsonb) || ${sql.json({
      sensitiveDataConsentAt: new Date().toISOString(),
    })} WHERE id = ${user.id}`
    await sql.end()

    const phone = devices["Pixel 7"]
    const ctx = await browser.newContext({
      ...phone,
      userAgent: `${phone.userAgent} TTMApp/1`,
      storageState: await api.storageState(),
      baseURL,
    })
    const page = await ctx.newPage()

    // Opened from outside straight onto Settings (like a notification link).
    await page.goto(OUTSIDE)
    await page.goto("/settings")
    await page.waitForLoadState("networkidle")
    // Still showing Settings (the feed is only put underneath).
    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.locator(".ttm-app-dock")).toHaveCount(0)
    await page.goBack()
    await expect(page).toHaveURL(/\/app$/, { timeout: 15_000 })

    // The back arrow with no in-app history: to the feed, not to the outside page.
    await page.goto(OUTSIDE)
    await page.goto("/about")
    await page.waitForLoadState("networkidle")
    const arrow = page.locator(".ttm-app-back").first()
    await expect(arrow).toBeVisible()
    await arrow.click()
    await expect(page).toHaveURL(/\/app$/, { timeout: 15_000 })

    // With in-app history the arrow is a normal Back.
    await page.goto("/app")
    await page.waitForLoadState("networkidle")
    await page.locator('.ttm-app-dock a[href="/profile"]').click()
    await page.waitForURL(/\/profile$/)
    await page.goto("/about")
    await page.locator(".ttm-app-back").first().click()
    await expect(page).not.toHaveURL(/^data:/)

    await ctx.close()
    await api.dispose()
  })
})
