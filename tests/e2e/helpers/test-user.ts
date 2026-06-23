import type { APIRequestContext, Page } from "@playwright/test"

export type TestUser = {
  email: string
  password: string
  name: string
}

/** Unique credentials per test run — avoids collisions in shared CI Postgres. */
export function createTestUser(prefix = "e2e"): TestUser {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    email: `${prefix}-${id}@ttm-test.local`,
    password: "E2eTest!Pass123",
    name: "E2E Tester",
  }
}

export async function registerUserViaApi(
  request: APIRequestContext,
  user: TestUser
): Promise<void> {
  const res = await request.post("/api/v1/auth/register", {
    data: { email: user.email, password: user.password, name: user.name },
  })
  if (!res.ok()) {
    const body = await res.text()
    throw new Error(`register failed (${res.status()}): ${body}`)
  }
}

export async function loginViaUi(page: Page, user: TestUser): Promise<void> {
  await page.goto("/login")
  await page.locator('input[type="email"]').first().fill(user.email)
  await page.locator('input[type="password"]').first().fill(user.password)
  await page
    .getByRole("button", { name: /sign in|login|войти|вход|acceso|entrada|wejście|giriş/i })
    .click()
  await page.waitForURL(/\/(app|welcome)/, { timeout: 20_000 })
}
