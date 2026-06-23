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
 * DB-backed auth + discover flows live in auth.spec.ts and run in the CI `e2e` job.
 * Locally: npm run test:e2e:ci  (docker Postgres + migrate + server + Playwright)
 */
