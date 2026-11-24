import { test, expect, request as playwrightRequest, type APIRequestContext } from "@playwright/test"
import { createTestUser, markEmailVerified, registerUserViaApi, type RegisteredUser } from "./helpers/test-user"

/**
 * Blind Date API — critical scenarios with two real users against Postgres:
 * eligibility, matchmaking into one room, anonymous snapshot, message moderation,
 * hidden peer decision, mutual Continue → existing match, leave, report + block.
 *
 * Time travel (ending the 10-minute date early) is done directly in the test database,
 * like `markEmailVerified`, so the suite stays fast.
 */

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"

async function requireProductionDb(request: APIRequestContext): Promise<void> {
  const res = await request.get("/api/ready")
  const body = (await res.json()) as { mode?: string; database?: string }
  test.skip(body.mode !== "production" || body.database !== "ok", "Requires Postgres (DATABASE_URL + AUTH_SECRET)")
}

async function withDb<T>(fn: (sql: import("postgres").Sql) => Promise<T>): Promise<T> {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is required for blind date tests")
  const { default: postgres } = await import("postgres")
  const sql = postgres(url, { max: 1 })
  try {
    return await fn(sql)
  } finally {
    await sql.end()
  }
}

/**
 * Makes a user eligible: verified, adult, Art. 9 consent, gender + looking-for.
 * The unusual age (≈77) and matching age range keep test users from pairing with
 * anyone else who may be waiting in a shared database.
 */
async function prepareUser(
  user: RegisteredUser,
  opts: { gender: "male" | "female"; lookingFor: "men" | "women"; consent?: boolean; birthYearsAgo?: number }
) {
  await markEmailVerified(user.email)
  const years = opts.birthYearsAgo ?? 77
  await withDb(async (sql) => {
    const profile = {
      lookingFor: opts.lookingFor,
      ...(opts.consent === false ? {} : { sensitiveDataConsentAt: new Date().toISOString() }),
    }
    await sql`
      UPDATE users SET gender = ${opts.gender}, age_min = 75, age_max = 80, is_active = true,
        birth_date = (now() - (${years} || ' years')::interval - interval '30 days')::date,
        profile = COALESCE(profile, '{}'::jsonb) || ${sql.json(profile)}
      WHERE id = ${user.id}
    `
  })
}

/** Users created by this file; deleted afterwards so other suites (e.g. the Discover feed) are unaffected. */
const createdUserIds: string[] = []

async function newUser(prefix: string, gender: "male" | "female", lookingFor: "men" | "women") {
  const request = await playwrightRequest.newContext({
    baseURL,
    extraHTTPHeaders: { origin: baseURL },
  })
  const user = await registerUserViaApi(request, { ...createTestUser(prefix), name: `${prefix === "bd-a" ? "Anna" : "Marco"} Tester` })
  createdUserIds.push(user.id)
  await prepareUser(user, { gender, lookingFor })
  return { request, user }
}

async function endDateNow(roomId: string) {
  await withDb(async (sql) => {
    await sql`UPDATE blind_date_rooms SET ends_at = now() - interval '1 second' WHERE id = ${roomId}`
  })
}

test.describe("Blind Date @db", () => {
  test.beforeEach(async ({ request }) => {
    await requireProductionDb(request)
  })

  test.afterAll(async () => {
    if (createdUserIds.length === 0 || !process.env.DATABASE_URL) return
    const ids = createdUserIds.splice(0)
    // Rooms, messages, likes and the match are removed by ON DELETE CASCADE.
    await withDb((sql) => sql`DELETE FROM users WHERE id = ANY(${ids}::uuid[])`)
  })

  test("two people are paired, chat anonymously and both Continue → match", async () => {
    const a = await newUser("bd-a", "female", "men")
    const b = await newUser("bd-b", "male", "women")
    try {
      const stateA = await (await a.request.get("/api/blind-date/state")).json()
      expect(stateA).toMatchObject({ state: "idle", eligible: true })

      const joinA = await a.request.post("/api/blind-date/queue", { data: { lang: "en" } })
      expect(joinA.status()).toBe(200)
      expect(await joinA.json()).toMatchObject({ state: "searching" })

      const joinB = await b.request.post("/api/blind-date/queue", { data: { lang: "de", languages: ["en"] } })
      const joinBBody = (await joinB.json()) as { state: string; roomId: string }
      expect(joinBBody.state).toBe("matched")
      const roomId = joinBBody.roomId

      // A's next poll finds the same room (reconnection path).
      const pollA = await (await a.request.post("/api/blind-date/queue", { data: { lang: "en" } })).json()
      expect(pollA).toMatchObject({ state: "matched", roomId })
      expect(await (await a.request.get("/api/blind-date/state")).json()).toMatchObject({ state: "in_room", roomId })

      // Snapshot shows only first name + age, never e-mail or photos.
      const snapA = await (await a.request.get(`/api/blind-date/rooms/${roomId}`)).json()
      expect(snapA.phase).toBe("active")
      expect(snapA.peer.name).toBe("Marco")
      expect(snapA.peer.age).toBe(77)
      expect(snapA.revealStage).toBe(0)
      const raw = JSON.stringify(snapA)
      expect(raw).not.toContain(b.user.email)
      expect(raw).not.toMatch(/https?:\/\/|data:image|photo/i)

      // Unchanged version → lightweight response.
      const unchanged = await (await a.request.get(`/api/blind-date/rooms/${roomId}?since=${snapA.version}`)).json()
      expect(unchanged).toMatchObject({ unchanged: true })

      // Contact details are blocked during an anonymous date.
      const bad = await a.request.post(`/api/blind-date/rooms/${roomId}/messages`, { data: { body: "my insta is @anna_77 " } })
      expect(bad.status()).toBe(422)
      expect((await bad.json()).error).toBe("contact_details")
      const phone = await b.request.post(`/api/blind-date/rooms/${roomId}/messages`, { data: { body: "call +49 151 2345 6789" } })
      expect(phone.status()).toBe(422)

      // Mutual messages raise the shared progress.
      for (let i = 0; i < 3; i++) {
        expect((await a.request.post(`/api/blind-date/rooms/${roomId}/messages`, { data: { body: `Hi ${i} from A` } })).status()).toBe(200)
        expect((await b.request.post(`/api/blind-date/rooms/${roomId}/messages`, { data: { body: `Hello ${i} from B` } })).status()).toBe(200)
      }
      const snapB = await (await b.request.get(`/api/blind-date/rooms/${roomId}`)).json()
      expect(snapB.messages).toHaveLength(6)
      expect(snapB.messages.filter((m: { mine: boolean }) => m.mine)).toHaveLength(3)
      expect(snapB.progress).toBe(15)
      expect(snapB.unlockedStage).toBe(0)

      // Reveal needs consent from both: one consent alone shows nothing.
      const r1 = await (await a.request.post(`/api/blind-date/rooms/${roomId}/reveal`, { data: { consent: true } })).json()
      expect(r1.me.revealConsent).toBe(true)
      expect(r1.revealStage).toBe(0)
      expect((await a.request.get(`/api/blind-date/rooms/${roomId}/photo`)).status()).toBe(403)

      // Both consent + enough mutual messages (5 each = 25 %) → a degraded copy of B's photo.
      await withDb((sql) => sql`UPDATE users SET profile = profile || '{"photoUrls":["/demo/people/demo-4.jpg"]}'::jsonb WHERE id = ${b.user.id}`)
      await b.request.post(`/api/blind-date/rooms/${roomId}/reveal`, { data: { consent: true } })
      for (let i = 3; i < 5; i++) {
        await a.request.post(`/api/blind-date/rooms/${roomId}/messages`, { data: { body: `More ${i} from A` } })
        await b.request.post(`/api/blind-date/rooms/${roomId}/messages`, { data: { body: `More ${i} from B` } })
      }
      const revealed = await (await a.request.get(`/api/blind-date/rooms/${roomId}`)).json()
      expect(revealed.revealStage).toBe(25)
      expect(JSON.stringify(revealed)).not.toContain("demo-4")
      const photo = await a.request.get(`/api/blind-date/rooms/${roomId}/photo`)
      expect(photo.status()).toBe(200)
      expect(photo.headers()["content-type"]).toBe("image/jpeg")
      expect(photo.headers()["x-reveal-stage"]).toBe("25")
      const original = await a.request.get("/demo/people/demo-4.jpg")
      expect(Buffer.compare(await photo.body(), await original.body())).not.toBe(0)
      // A has no photo: B gets 404, never a placeholder or someone else's image.
      expect((await b.request.get(`/api/blind-date/rooms/${roomId}/photo`)).status()).toBe(404)

      // Deciding is only possible after the date.
      const early = await a.request.post(`/api/blind-date/rooms/${roomId}/decision`, { data: { decision: "continue" } })
      expect(early.status()).toBe(409)

      await endDateNow(roomId)
      const dA = await (await a.request.post(`/api/blind-date/rooms/${roomId}/decision`, { data: { decision: "continue" } })).json()
      expect(dA.phase).toBe("deciding")
      expect(dA.me.decision).toBe("continue")

      // B sees that A decided, but not what.
      const viewB = await (await b.request.get(`/api/blind-date/rooms/${roomId}`)).json()
      expect(viewB.peer.decided).toBe(true)
      expect(viewB.peer.decision).toBeNull()

      // Messages are closed after the date.
      expect((await b.request.post(`/api/blind-date/rooms/${roomId}/messages`, { data: { body: "late" } })).status()).toBe(409)

      const dB = await (await b.request.post(`/api/blind-date/rooms/${roomId}/decision`, { data: { decision: "continue" } })).json()
      expect(dB.phase).toBe("closed")
      expect(dB.outcome.reason).toBe("matched")
      expect(dB.outcome.matchId).toBeTruthy()
      expect(dB.peer.decision).toBe("continue")

      // The existing match list now contains the pair (24 h timer, chat).
      const matches = (await (await a.request.get("/api/matches")).json()) as { matches: Array<{ peerUserId: string }> }
      expect(matches.matches.some((m) => m.peerUserId === b.user.id)).toBeTruthy()

      // GDPR export contains the date and the user's own messages.
      const exportA = await (await a.request.get("/api/me/export")).text()
      expect(exportA).toContain(roomId)
      expect(exportA).toContain("Hi 0 from A")
      expect(exportA).not.toContain("Hello 0 from B")

      // A decision cannot be changed afterwards.
      expect((await a.request.post(`/api/blind-date/rooms/${roomId}/decision`, { data: { decision: "pass" } })).status()).toBe(409)

      // The same pair is not matched again.
      await a.request.post("/api/blind-date/queue", { data: { lang: "en" } })
      expect(await (await b.request.post("/api/blind-date/queue", { data: { lang: "en" } })).json()).toMatchObject({ state: "searching" })
      await a.request.delete("/api/blind-date/queue")
      await b.request.delete("/api/blind-date/queue")
    } finally {
      await a.request.dispose()
      await b.request.dispose()
    }
  })

  test("one Pass closes without a match and without revealing who passed early", async () => {
    const a = await newUser("bd-a", "female", "men")
    const b = await newUser("bd-b", "male", "women")
    try {
      await a.request.post("/api/blind-date/queue", { data: { lang: "en" } })
      const { roomId } = await (await b.request.post("/api/blind-date/queue", { data: { lang: "en" } })).json()
      expect(roomId).toBeTruthy()
      await endDateNow(roomId)
      await a.request.post(`/api/blind-date/rooms/${roomId}/decision`, { data: { decision: "pass" } })
      const res = await (await b.request.post(`/api/blind-date/rooms/${roomId}/decision`, { data: { decision: "continue" } })).json()
      expect(res.phase).toBe("closed")
      expect(res.outcome).toMatchObject({ reason: "no_match", matchId: null })
      const matches = (await (await b.request.get("/api/matches")).json()) as { matches: Array<{ peerUserId: string }> }
      expect(matches.matches.some((m) => m.peerUserId === a.user.id)).toBeFalsy()
    } finally {
      await a.request.dispose()
      await b.request.dispose()
    }
  })

  test("leave, report + block, and access control", async () => {
    const a = await newUser("bd-a", "female", "men")
    const b = await newUser("bd-b", "male", "women")
    const stranger = await newUser("bd-x", "female", "women")
    try {
      await a.request.post("/api/blind-date/queue", { data: { lang: "en" } })
      const { roomId } = await (await b.request.post("/api/blind-date/queue", { data: { lang: "en" } })).json()
      expect(roomId).toBeTruthy()

      // Someone outside the room cannot read or act on it.
      expect((await stranger.request.get(`/api/blind-date/rooms/${roomId}`)).status()).toBe(404)
      expect((await stranger.request.get(`/api/blind-date/rooms/${roomId}/photo`)).status()).toBe(404)
      expect((await stranger.request.post(`/api/blind-date/rooms/${roomId}/messages`, { data: { body: "hey" } })).status()).toBe(404)

      // A joining twice does not create a second room.
      expect(await (await a.request.post("/api/blind-date/queue", { data: { lang: "en" } })).json()).toMatchObject({ roomId })

      // Report + block closes the room for both.
      const rep = await a.request.post(`/api/blind-date/rooms/${roomId}/report`, {
        data: { reason: "trustReportHarassment", comment: "test", block: true },
      })
      expect(rep.status()).toBe(200)
      const viewB = await (await b.request.get(`/api/blind-date/rooms/${roomId}`)).json()
      expect(viewB.phase).toBe("closed")
      expect(viewB.outcome.reason).toBe("reported")
      expect(viewB.outcome.leftByMe).toBe(false)

      const stored = await withDb(
        (sql) => sql`SELECT
          (SELECT count(*)::int FROM reports WHERE blind_date_room_id = ${roomId}) AS reports,
          (SELECT count(*)::int FROM user_blocks WHERE blocker_id = ${a.user.id} AND blocked_id = ${b.user.id}) AS blocks`
      )
      expect(stored[0]).toMatchObject({ reports: 1, blocks: 1 })

      // Blocked people are never paired again (even after the cooldown).
      await withDb((sql) => sql`UPDATE blind_date_rooms SET started_at = now() - interval '60 days' WHERE id = ${roomId}`)
      await a.request.post("/api/blind-date/queue", { data: { lang: "en" } })
      expect(await (await b.request.post("/api/blind-date/queue", { data: { lang: "en" } })).json()).toMatchObject({ state: "searching" })
      await a.request.delete("/api/blind-date/queue")
      await b.request.delete("/api/blind-date/queue")
    } finally {
      await a.request.dispose()
      await b.request.dispose()
      await stranger.request.dispose()
    }
  })

  test("leaving ends the date for both", async () => {
    const a = await newUser("bd-a", "female", "men")
    const b = await newUser("bd-b", "male", "women")
    try {
      await a.request.post("/api/blind-date/queue", { data: { lang: "en" } })
      const { roomId } = await (await b.request.post("/api/blind-date/queue", { data: { lang: "en" } })).json()
      const left = await (await b.request.post(`/api/blind-date/rooms/${roomId}/leave`)).json()
      expect(left.outcome).toMatchObject({ reason: "left", leftByMe: true })
      const viewA = await (await a.request.get(`/api/blind-date/rooms/${roomId}`)).json()
      expect(viewA.outcome).toMatchObject({ reason: "left", leftByMe: false })
      expect(await (await a.request.get("/api/blind-date/state")).json()).toMatchObject({ state: "idle" })
    } finally {
      await a.request.dispose()
      await b.request.dispose()
    }
  })

  test("eligibility: Art. 9 consent and age 18+ are required", async () => {
    const ctx = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    try {
      const user = await registerUserViaApi(ctx, createTestUser("bd-e"))
      createdUserIds.push(user.id)
      await prepareUser(user, { gender: "female", lookingFor: "men", consent: false })
      const noConsent = await ctx.post("/api/blind-date/queue", { data: { lang: "en" } })
      expect(noConsent.status()).toBe(403)
      expect((await noConsent.json()).error).toBe("consent_required")

      await prepareUser(user, { gender: "female", lookingFor: "men", birthYearsAgo: 16 })
      const minor = await ctx.post("/api/blind-date/queue", { data: { lang: "en" } })
      expect(minor.status()).toBe(403)
      expect((await minor.json()).error).toBe("under_18")
      expect(await (await ctx.get("/api/blind-date/state")).json()).toMatchObject({ eligible: false, reason: "under_18" })

      // Not signed in → 401.
      const anon = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
      expect((await anon.get("/api/blind-date/state")).status()).toBe(401)
      await anon.dispose()
    } finally {
      await ctx.dispose()
    }
  })

  test("simultaneous joins create exactly one room", async () => {
    const a = await newUser("bd-a", "female", "men")
    const b = await newUser("bd-b", "male", "women")
    try {
      const results = await Promise.all([
        a.request.post("/api/blind-date/queue", { data: { lang: "en" } }),
        b.request.post("/api/blind-date/queue", { data: { lang: "en" } }),
        a.request.post("/api/blind-date/queue", { data: { lang: "en" } }),
        b.request.post("/api/blind-date/queue", { data: { lang: "en" } }),
      ])
      for (const r of results) expect(r.status()).toBe(200)
      const rooms = await withDb(
        (sql) => sql`SELECT count(*)::int AS n FROM blind_date_rooms
          WHERE (user_a = ${a.user.id} OR user_b = ${a.user.id}) AND status <> 'closed'`
      )
      expect(rooms[0].n).toBe(1)
    } finally {
      await a.request.dispose()
      await b.request.dispose()
    }
  })

  test("UI: start screen → search → room → message", async ({ page }) => {
    const user = await registerUserViaApi(page.request, { ...createTestUser("bd-ui"), name: "Lena Tester" })
    createdUserIds.push(user.id)
    await prepareUser(user, { gender: "female", lookingFor: "men" })
    const b = await newUser("bd-b", "male", "women")
    try {
      await page.goto("/app/blind-date")
      const start = page.locator(".bd-intro .bd-btn--primary")
      await expect(start).toBeEnabled()
      await start.click()
      await expect(page.locator(".bd-search")).toBeVisible()

      const join = await (await b.request.post("/api/blind-date/queue", { data: { lang: "en" } })).json()
      expect(join.state).toBe("matched")

      await expect(page.locator(".bd-room-head__name")).toContainText("Marco", { timeout: 15_000 })
      await expect(page.locator(".bd-timer")).toBeVisible()
      await page.locator(".bd-composer input").fill("Hi Marco!")
      await page.locator(".bd-send").click()
      await expect(page.locator(".bd-msg--mine")).toHaveText("Hi Marco!")

      // The peer's message arrives through polling.
      await b.request.post(`/api/blind-date/rooms/${join.roomId}/messages`, { data: { body: "Hi Lena" } })
      await expect(page.locator(".bd-msg:not(.bd-msg--mine)")).toHaveText("Hi Lena", { timeout: 10_000 })

      // Leaving from the menu shows the result screen.
      await page.locator(".bd-room-head .bd-icon-btn").click()
      await page.locator(".bd-sheet__item").first().click()
      await page.locator(".bd-sheet .bd-btn--primary").click()
      await expect(page.locator(".bd-result")).toBeVisible()
    } finally {
      await b.request.dispose()
    }
  })
})
