import { test, expect } from "@playwright/test"
import {
  createTestUser,
  loginViaUi,
  registerUserViaApi,
} from "./helpers/test-user"

async function requireProductionDb(
  request: import("@playwright/test").APIRequestContext
): Promise<void> {
  const res = await request.get("/api/ready")
  const body = (await res.json()) as { mode?: string; database?: string }
  test.skip(
    body.mode !== "production" || body.database !== "ok",
    "Requires Postgres (DATABASE_URL + AUTH_SECRET)"
  )
}

test.describe("Production auth @db", () => {
  test.beforeEach(async ({ request }) => {
    await requireProductionDb(request)
  })

  test("ready endpoint reports production mode", async ({ request }) => {
    const res = await request.get("/api/ready")
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body).toMatchObject({
      mode: "production",
      database: "ok",
      auth: "ok",
    })
  })

  test("registers a new user via API and returns session", async ({ page }) => {
    const user = createTestUser("register")
    const res = await page.request.post("/api/v1/auth/register", {
      data: { email: user.email, password: user.password, name: user.name },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.user.email).toBe(user.email)

    const me = await page.request.get("/api/me")
    expect(me.ok()).toBeTruthy()
    const meBody = await me.json()
    expect(meBody.user?.email).toBe(user.email)
  })

  test("logs in via the login form", async ({ page }) => {
    const user = createTestUser("login")
    await registerUserViaApi(page.request, user)

    await page.context().clearCookies()
    await loginViaUi(page, user)
    await expect(page).toHaveURL(/\/(app|welcome)/)
  })

  test("authenticated user can open the discover app", async ({ page }) => {
    const user = createTestUser("app")
    await registerUserViaApi(page.request, user)

    await page.context().clearCookies()
    await loginViaUi(page, user)

    await page.evaluate(() => localStorage.setItem("ttm-welcome-seen", "1"))
    await page.goto("/app")
    await expect(page).toHaveURL(/\/app/, { timeout: 20_000 })
    await expect(page.getByRole("navigation", { name: "App" })).toBeVisible({
      timeout: 20_000,
    })
  })

  test("discover API returns a deck for authenticated user", async ({ page }) => {
    const user = createTestUser("discover")
    await registerUserViaApi(page.request, user)

    const res = await page.request.get("/api/discover")
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(Array.isArray(body.profiles)).toBeTruthy()
  })
})
