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

  test("two registered users with photos appear in each other's Discover feed", async ({ playwright }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"
    const userA = createTestUser("disc-a")
    const userB = createTestUser("disc-b")

    const ctxA = await playwright.request.newContext({ baseURL })
    const ctxB = await playwright.request.newContext({ baseURL })

    try {
      const registeredA = await registerUserViaApi(ctxA, userA)
      const registeredB = await registerUserViaApi(ctxB, userB)

      // Without a photo a profile is not shown in Discover (the app asks people to add one first).
      const before = (await (await ctxA.get("/api/discover")).json()) as { profiles: Array<{ id: string }> }
      expect(before.profiles.some((p) => p.id === registeredB.id)).toBeFalsy()

      const { default: postgres } = await import("postgres")
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
      await sql`UPDATE users SET profile = COALESCE(profile, '{}'::jsonb) || ${sql.json({
        photoUrls: ["/demo/people/demo-5.jpg"],
      })} WHERE id IN ${sql([registeredA.id, registeredB.id])}`
      await sql.end()

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
