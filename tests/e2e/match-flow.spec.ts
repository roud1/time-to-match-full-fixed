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

test.describe("Match flow @db", () => {
  test.beforeEach(async ({ request }) => {
    await requireProductionDb(request)
  })

  test("mutual likes create a match visible to both users", async ({ playwright }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"
    const userA = createTestUser("match-a")
    const userB = createTestUser("match-b")

    const ctxA = await playwright.request.newContext({ baseURL })
    const ctxB = await playwright.request.newContext({ baseURL })

    try {
      const registeredA = await registerUserViaApi(ctxA, userA)
      const registeredB = await registerUserViaApi(ctxB, userB)

      const likeFromA = await ctxA.post("/api/discover/like", {
        data: { targetUserId: registeredB.id },
      })
      expect(likeFromA.ok()).toBeTruthy()
      const likeFromABody = (await likeFromA.json()) as { liked: boolean; matched: boolean }
      expect(likeFromABody).toMatchObject({ liked: true, matched: false })

      const likeFromB = await ctxB.post("/api/discover/like", {
        data: { targetUserId: registeredA.id },
      })
      expect(likeFromB.ok()).toBeTruthy()
      const likeFromBBody = (await likeFromB.json()) as {
        liked: boolean
        matched: boolean
        matchId?: string
      }
      expect(likeFromBBody).toMatchObject({ liked: true, matched: true })
      expect(likeFromBBody.matchId).toBeTruthy()

      const matchesA = await ctxA.get("/api/matches")
      expect(matchesA.ok()).toBeTruthy()
      const matchesABody = (await matchesA.json()) as {
        matches: Array<{ peerUserId: string; id: string }>
      }
      expect(matchesABody.matches.some((m) => m.peerUserId === registeredB.id)).toBeTruthy()

      const matchesB = await ctxB.get("/api/matches")
      expect(matchesB.ok()).toBeTruthy()
      const matchesBBody = (await matchesB.json()) as {
        matches: Array<{ peerUserId: string; id: string }>
      }
      expect(matchesBBody.matches.some((m) => m.peerUserId === registeredA.id)).toBeTruthy()
    } finally {
      await ctxA.dispose()
      await ctxB.dispose()
    }
  })
})
