import { test, expect } from "@playwright/test"
import { createTestUser, registerUserViaApi } from "./helpers/test-user"

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

test.describe("Discover visibility @db", () => {
  test.beforeEach(async ({ request }) => {
    await requireProductionDb(request)
  })

  test("two registered users appear in each other's Discover feed", async ({ playwright }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"
    const userA = createTestUser("disc-a")
    const userB = createTestUser("disc-b")

    const ctxA = await playwright.request.newContext({ baseURL })
    const ctxB = await playwright.request.newContext({ baseURL })

    try {
      const registeredA = await registerUserViaApi(ctxA, userA)
      const registeredB = await registerUserViaApi(ctxB, userB)

      const discoverA = await ctxA.get("/api/discover")
      expect(discoverA.ok()).toBeTruthy()
      const bodyA = (await discoverA.json()) as { profiles: Array<{ id: string }> }
      expect(bodyA.profiles.some((p) => p.id === registeredB.id)).toBeTruthy()

      const discoverB = await ctxB.get("/api/discover")
      expect(discoverB.ok()).toBeTruthy()
      const bodyB = (await discoverB.json()) as { profiles: Array<{ id: string }> }
      expect(bodyB.profiles.some((p) => p.id === registeredA.id)).toBeTruthy()
    } finally {
      await ctxA.dispose()
      await ctxB.dispose()
    }
  })
})
