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
      const matches = (await (await a.request.get("/api/matches")).json()) as {
        matches: Array<{ peerUserId: string; peerAge?: number | null; peerPhoto?: string | null }>
      }
      const fromDate = matches.matches.find((m) => m.peerUserId === b.user.id)
      expect(fromDate).toBeTruthy()
      // Real age in the chat header; the photo stays hidden until the date's reveal reached 100 %.
      expect(fromDate!.peerAge).toBe(77)
      expect(fromDate!.peerPhoto).toBeNull()
      await withDb((sql) => sql`UPDATE blind_date_rooms SET reveal_level = 100 WHERE id = ${roomId}`)
      const revealedList = (await (await a.request.get("/api/matches")).json()) as typeof matches
      expect(revealedList.matches.find((m) => m.peerUserId === b.user.id)?.peerPhoto).toBe("/demo/people/demo-4.jpg")

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

      // Games tab: start This or That, both answer, the shared result appears.
      await page.getByRole("tab").nth(1).click()
      await page.locator(".bd-gitem").first().click()
      await expect(page.locator(".bd-round")).toBeVisible()
      await page.locator(".bd-option").first().click()
      await expect(page.locator(".bd-round__wait")).toBeVisible()
      const snapB = await (await b.request.get(`/api/blind-date/rooms/${join.roomId}`)).json()
      await b.request.post(`/api/blind-date/rooms/${join.roomId}/games/answer`, {
        data: { sessionId: snapB.game.id, round: 0, answer: { choice: 0 } },
      })
      await expect(page.locator(".bd-last--match")).toBeVisible({ timeout: 10_000 })
      await expect(page.locator(".bd-play__step")).toHaveText("2 / 5")
      await page.locator(".bd-play__end").click()
      await expect(page.locator(".bd-summary")).toBeVisible({ timeout: 10_000 })

      // Leaving from the menu shows the result screen.
      await page.locator(".bd-room-head .bd-icon-btn").click()
      await page.locator(".bd-sheet__item").first().click()
      await page.locator(".bd-sheet .bd-btn--primary").click()
      await expect(page.locator(".bd-result")).toBeVisible()
    } finally {
      await b.request.dispose()
    }
  })

  test("games: synchronized rounds, hidden answers, progress, one game at a time", async () => {
    const a = await newUser("bd-a", "female", "men")
    const b = await newUser("bd-b", "male", "women")
    const stranger = await newUser("bd-x", "female", "women")
    try {
      await a.request.post("/api/blind-date/queue", { data: { lang: "en" } })
      const { roomId } = await (await b.request.post("/api/blind-date/queue", { data: { lang: "en" } })).json()
      const base = `/api/blind-date/rooms/${roomId}/games`

      expect((await a.request.post(base, { data: { game: "nope" } })).status()).toBe(400)
      const started = await (await a.request.post(base, { data: { game: "this_or_that" } })).json()
      expect(started.game).toMatchObject({ key: "this_or_that", status: "active", current: 0, total: 5 })
      const sessionId = started.game.id as string
      // Only one game at a time; outsiders cannot touch it.
      expect((await b.request.post(base, { data: { game: "spark" } })).status()).toBe(409)
      expect((await stranger.request.post(`${base}/answer`, { data: { sessionId, round: 0, answer: { choice: 0 } } })).status()).toBe(404)

      const answer = (ctx: typeof a, round: number, choice: number) =>
        ctx.request.post(`${base}/answer`, { data: { sessionId, round, answer: { choice } } })

      expect((await answer(a, 0, 1)).status()).toBe(200)
      // B sees that A answered but not the answer.
      const viewB = await (await b.request.get(`/api/blind-date/rooms/${roomId}`)).json()
      expect(viewB.game.round).toMatchObject({ index: 0, peerAnswered: true, mine: null, theirs: null })
      expect((await answer(a, 0, 0)).status()).toBe(409) // already answered
      expect((await answer(b, 0, 1)).status()).toBe(200)
      const afterRound = await (await a.request.get(`/api/blind-date/rooms/${roomId}`)).json()
      expect(afterRound.game.current).toBe(1)
      expect(afterRound.game.history[0]).toMatchObject({ matched: true, theirs: { choice: 1 } })

      // Skip one, play the rest.
      expect((await b.request.post(`${base}/skip`, { data: { sessionId, round: 1 } })).status()).toBe(200)
      for (const round of [2, 3, 4]) {
        await answer(a, round, 0)
        await answer(b, round, round === 4 ? 1 : 0)
      }
      const done = await (await a.request.get(`/api/blind-date/rooms/${roomId}`)).json()
      expect(done.game).toMatchObject({ status: "completed", result: { answered: 4, comparable: 4, matches: 3 } })
      expect(done.gamesPlayed).toHaveLength(1)
      expect(done.progress).toBe(15) // one shared game, no messages yet

      // Two truths: B never receives the lie index while guessing.
      const tt = await (await b.request.post(base, { data: { game: "two_truths" } })).json()
      const ttId = tt.game.id as string
      await a.request.post(`${base}/answer`, {
        data: { sessionId: ttId, round: 0, answer: { statements: ["I swim", "I sing", "I fly"], lie: 2 } },
      })
      const guessView = await (await b.request.get(`/api/blind-date/rooms/${roomId}`)).json()
      expect(guessView.game.round.statements).toEqual(["I swim", "I sing", "I fly"])
      expect(JSON.stringify(guessView.game)).not.toContain('"lie"')
      await b.request.post(`${base}/answer`, { data: { sessionId: ttId, round: 0, answer: { guess: 2 } } })
      // Ending early still counts when a round was played by both.
      const ended = await (await a.request.post(`${base}/end`, { data: { sessionId: ttId } })).json()
      expect(ended.game).toMatchObject({ status: "completed", result: { answered: 1, matches: 1 } })
      expect(ended.progress).toBe(30)

      // Spark: a round that ran out is skipped by the server even if nobody acts.
      const sp = await (await a.request.post(base, { data: { game: "spark" } })).json()
      await withDb(
        (sql) => sql`UPDATE blind_date_game_sessions
          SET state = jsonb_set(state, '{roundStartedAt}', to_jsonb(to_char((now() - interval '16 seconds') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')))
          WHERE id = ${sp.game.id}`
      )
      const ticked = await (await a.request.get(`/api/blind-date/rooms/${roomId}?since=${sp.version}`)).json()
      expect(ticked.game.current).toBe(1)
      expect(ticked.game.history[0].skipped).toBe(true)

      // Games stop with the date.
      await endDateNow(roomId)
      const deciding = await (await a.request.get(`/api/blind-date/rooms/${roomId}`)).json()
      expect(deciding.phase).toBe("deciding")
      expect(deciding.game.status).toBe("abandoned")
      expect((await a.request.post(base, { data: { game: "this_or_that" } })).status()).toBe(409)
    } finally {
      await a.request.dispose()
      await b.request.dispose()
      await stranger.request.dispose()
    }
  })

  test("connection report: local without consent, AI only with both consents, filtered and cached", async () => {
    const a = await newUser("bd-a", "female", "men")
    const b = await newUser("bd-b", "male", "women")
    const c = await newUser("bd-a", "female", "men")
    const d = await newUser("bd-b", "male", "women")
    try {
      // ── Pair 1: nobody consented to AI ──
      await a.request.post("/api/blind-date/queue", { data: { lang: "en" } })
      const { roomId } = await (await b.request.post("/api/blind-date/queue", { data: { lang: "en" } })).json()
      const insights = (ctx: typeof a, id: string) => ctx.request.get(`/api/blind-date/rooms/${id}/insights?lang=en`)
      expect((await insights(a, roomId)).status()).toBe(409) // not ready during the date
      for (let i = 0; i < 3; i++) {
        await a.request.post(`/api/blind-date/rooms/${roomId}/messages`, { data: { body: `Secret detail ${i} from A` } })
        await b.request.post(`/api/blind-date/rooms/${roomId}/messages`, { data: { body: `Reply ${i} from B` } })
      }
      const game = await (await a.request.post(`/api/blind-date/rooms/${roomId}/games`, { data: { game: "perfect_date" } })).json()
      for (let r = 0; r < 4; r++) {
        await a.request.post(`/api/blind-date/rooms/${roomId}/games/answer`, { data: { sessionId: game.game.id, round: r, answer: { choice: 0 } } })
        await b.request.post(`/api/blind-date/rooms/${roomId}/games/answer`, { data: { sessionId: game.game.id, round: r, answer: { choice: r < 2 ? 0 : 1 } } })
      }
      await endDateNow(roomId)
      const local = await (await insights(a, roomId)).json()
      expect(local).toMatchObject({ source: "local", aiStatus: "no_consent", myAiConsent: false, ai: null, messages: { mine: 3, theirs: 3 } })
      expect(local.sameAnswers).toEqual([
        { prompt: "pd1", option: 0 },
        { prompt: "pd2", option: 0 },
      ])
      expect(local.starters).toHaveLength(3)
      expect(JSON.stringify(local)).not.toContain("Secret detail") // the local report never quotes messages
      const usage1 = await withDb((sql) => sql`SELECT count(*)::int AS n FROM ai_usage WHERE user_id IN (${a.user.id}, ${b.user.id})`)
      expect(usage1[0].n).toBe(0) // AI was never called
      // Outsiders cannot read it.
      expect((await insights(c, roomId)).status()).toBe(404)

      // ── Pair 2: both consented ──
      await withDb((sql) => sql`UPDATE users SET profile = profile || '{"aiInsightsConsent": true}'::jsonb WHERE id IN (${c.user.id}, ${d.user.id})`)
      await c.request.post("/api/blind-date/queue", { data: { lang: "en" } })
      const room2 = (await (await d.request.post("/api/blind-date/queue", { data: { lang: "en" } })).json()).roomId
      expect(room2).toBeTruthy()
      for (let i = 0; i < 3; i++) {
        await c.request.post(`/api/blind-date/rooms/${room2}/messages`, { data: { body: `Hello ${i}` } })
        await d.request.post(`/api/blind-date/rooms/${room2}/messages`, { data: { body: `Hi ${i}` } })
      }
      await endDateNow(room2)
      const res = await (await insights(c, room2)).json()
      if (res.aiStatus === "unavailable") {
        test.info().annotations.push({ type: "note", description: "AI_TEST_PROVIDER is not enabled on the server; AI path not checked" })
      } else {
        expect(res).toMatchObject({ source: "ai", aiStatus: "ok", myAiConsent: true })
        expect(res.ai.summary).toBe("Test summary (6 lines).") // the provider received the 6 messages
        expect(res.ai.themes).toEqual(["travel", "books"]) // "40% compatible" removed
        expect(res.ai.starters).toEqual(["What was the best trip you ever took?"]) // the "diagnosis" removed
        // Cached: same report again, one AI call recorded.
        const again = await (await insights(c, room2)).json()
        expect(again.createdAt).toBe(res.createdAt)
        const usage2 = await withDb((sql) => sql`SELECT count(*)::int AS n, max(provider) AS p FROM ai_usage WHERE user_id = ${c.user.id}`)
        expect(usage2[0]).toMatchObject({ n: 1, p: "test" })
      }
    } finally {
      for (const u of [a, b, c, d]) await u.request.dispose()
    }
  })
})
