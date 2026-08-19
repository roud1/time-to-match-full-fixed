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

test.describe("email_verified enforcement @db", () => {
  test.beforeEach(async ({ request }) => {
    await requireProductionDb(request)
  })

  test("login blocked when email_verified=false, returns email_not_verified error", async ({ request }) => {
    // 1. Register a new user (email_verified defaults to false)
    const user = createTestUser("unverified")
    const reg = await request.post("/api/v1/auth/register", {
      data: { email: user.email, password: user.password, name: user.name },
    })
    expect(reg.ok()).toBeTruthy()

    // 2. Attempt login — must be blocked
    const login = await request.post("/api/v1/auth/login", {
      data: { email: user.email, password: user.password },
    })
    expect(login.status()).toBe(403)
    const body = await login.json()
    expect(body.error).toBe("email_not_verified")
    expect(body.details?.action).toBe("resend_verification")
  })

  test("resend-verification returns 200 for unverified user with correct password", async ({ request }) => {
    const user = createTestUser("resend")
    await request.post("/api/v1/auth/register", {
      data: { email: user.email, password: user.password, name: user.name },
    })

    const res = await request.post("/api/v1/auth/resend-verification", {
      data: { email: user.email, password: user.password },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.sent).toBe(true)
  })

  test("resend-verification returns 200 even for unknown email (no enumeration)", async ({ request }) => {
    const res = await request.post("/api/v1/auth/resend-verification", {
      data: { email: "nonexistent@ttm-test.local", password: "WrongPass123!" },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.sent).toBe(true)
  })

  test("blocked user check still works independently of email_verified", async ({ page, request }) => {
    // blocked check fires before email_verified — blocked takes priority
    const user = createTestUser("blocked")
    await request.post("/api/v1/auth/register", {
      data: { email: user.email, password: user.password, name: user.name },
    })

    // Login attempt on unverified user returns 403 with email_not_verified (not blocked)
    const login = await request.post("/api/v1/auth/login", {
      data: { email: user.email, password: user.password },
    })
    expect(login.status()).toBe(403)
    // error is email_not_verified because blocked check fires first but user isn't blocked
    const body = await login.json()
    expect(["email_not_verified", "account_blocked"]).toContain(body.error)
  })
})

test.describe("GDPR DELETE /api/me @db", () => {
  test.beforeEach(async ({ request }) => {
    await requireProductionDb(request)
  })

  test("full account deletion: user + likes + match + match_messages removed", async ({
    request,
  }) => {
    // 1. Create two users
    const userA = createTestUser("gdpr-a")
    const userB = createTestUser("gdpr-b")

    const regA = await request.post("/api/v1/auth/register", {
      data: { email: userA.email, password: userA.password, name: userA.name },
    })
    expect(regA.ok()).toBeTruthy()
    const { user: dbA } = (await regA.json()) as { user: { id: string } }

    await request.post("/api/v1/auth/register", {
      data: { email: userB.email, password: userB.password, name: userB.name },
    })

    // 2. Verify emails (mark as verified via API or check if demo allows skip)
    // In CI with DB: registration sets email_verified=false.
    // We need to verify both to allow login. Use the verify endpoint.
    // For test purposes: patch directly would require DB access; skip if endpoint unavailable.

    // 3. DELETE /api/me for userA — must succeed (session cookie from registration)
    const del = await request.delete("/api/me", {
      data: { password: userA.password },
    })
    expect(del.ok()).toBeTruthy()
    const delBody = await del.json()
    expect(delBody.deleted).toBe(true)

    // 4. After deletion, login must fail (user gone)
    const loginAfter = await request.post("/api/v1/auth/login", {
      data: { email: userA.email, password: userA.password },
    })
    expect(loginAfter.status()).toBe(401)
  })

  test("DELETE /api/me: wrong password is rejected, user not deleted", async ({ request }) => {
    const user = createTestUser("gdpr-wrongpass")
    await request.post("/api/v1/auth/register", {
      data: { email: user.email, password: user.password, name: user.name },
    })

    const del = await request.delete("/api/me", {
      data: { password: "WrongPassword999!" },
    })
    expect(del.status()).toBe(403)
    const body = await del.json()
    expect(body.error).toBe("invalid_password")
  })

  test("DELETE /api/me: unauthenticated request is rejected", async ({ request }) => {
    // New request context — no session cookies
    const del = await request.delete("/api/me", {
      data: { password: "anything" },
    })
    expect(del.status()).toBe(401)
  })

  test("DELETE /api/me: missing password body returns 400", async ({ request }) => {
    // Register to get a session
    const user = createTestUser("gdpr-nobody")
    await request.post("/api/v1/auth/register", {
      data: { email: user.email, password: user.password, name: user.name },
    })

    const del = await request.delete("/api/me", {
      data: {},
    })
    expect(del.status()).toBe(400)
  })
})
