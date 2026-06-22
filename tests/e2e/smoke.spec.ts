import { test, expect } from "@playwright/test"

test.describe("Landing", () => {
  test("homepage loads with logo and CTA", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Time to Match/i)

    const logo = page.getByRole("img", { name: "Time to Match" })
    await expect(logo.first()).toBeVisible()

    const cta = page.getByRole("link", { name: /start matching|начать|register|регистрация/i }).first()
    await expect(cta).toBeVisible()
    await cta.click()
    await expect(page).toHaveURL(/\/(register|login)/)
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
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.mode).toMatch(/demo|production/)
  })
})

/**
 * Full register → match → chat flow requires DATABASE_URL on the server.
 * Run manually against a production-like instance:
 *
 *   DATABASE_URL=... AUTH_SECRET=... npm run build && npm run start
 *   BASE_URL=http://127.0.0.1:3000 node scripts/smoke-test.mjs
 */
