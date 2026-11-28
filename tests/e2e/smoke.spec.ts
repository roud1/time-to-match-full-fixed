import { test, expect } from "@playwright/test"

test.describe("Landing", () => {
  test("homepage (Kairo): brand, CTA to register, sign-in link, no horizontal scroll at 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto("/")
    await expect(page).toHaveTitle(/Kairo/i)
    await expect(page.getByRole("img", { name: "Kairo" }).first()).toBeVisible()
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.locator('img[src*="hero"], img[srcset*="hero"]').first()).toBeVisible()
    await expect(page.locator('a[href="/login"]').first()).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)

    await page.locator('main a[href="/register"]').first().click()
    await expect(page).toHaveURL(/\/register/)
  })
})

test.describe("Auth", () => {
  test("register form renders", async ({ page }) => {
    await page.goto("/register")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test("login page loads", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })
})

test.describe("API readiness", () => {
  test("ready endpoint responds", async ({ request }) => {
    const res = await request.get("/api/ready")
    // /api/ready correctly returns HTTP 503 in demo mode (no DATABASE_URL) —
    // that's the expected response for the build/smoke job which has no
    // database. We only assert the server answered with a valid body,
    // not that it reports "fully ready" in the production sense.
    expect([200, 503]).toContain(res.status())
    const body = await res.json()
    expect(body.mode).toMatch(/demo|production/)
  })
})

/**
 * DB-backed auth + discover flows live in auth.spec.ts and run in the CI `e2e` job.
 * Locally: npm run test:e2e:ci  (docker Postgres + migrate + server + Playwright)
 */
