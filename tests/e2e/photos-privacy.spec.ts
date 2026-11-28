import { test, expect, request as playwrightRequest, type APIRequestContext } from "@playwright/test"
import { createTestUser, registerUserViaApi } from "./helpers/test-user"

/**
 * Photos and location of OTHER people (critical fixes):
 *  - inline (data:) photos never travel inside feed JSON; they are served resized by /api/photos
 *    to signed-in viewers only, and not to someone who blocked / was blocked;
 *  - a profile without photos is not shown in the feed (the empty-card bug), and the bundled
 *    "no photo" picture used as a fallback exists;
 *  - the feed never contains exact coordinates; distances are whole kilometres;
 *  - the owner's own photos come back as short URLs and saving the profile keeps the originals.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"

async function withDb<T>(fn: (sql: import("postgres").Sql) => Promise<T>): Promise<T> {
  const { default: postgres } = await import("postgres")
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
  try {
    return await fn(sql)
  } finally {
    await sql.end()
  }
}

async function bigJpegDataUrl(): Promise<string> {
  const { default: sharp } = await import("sharp")
  const noise = Buffer.alloc(1600 * 1600 * 3)
  for (let i = 0; i < noise.length; i++) noise[i] = (i * 7919) % 251
  const jpeg = await sharp(noise, { raw: { width: 1600, height: 1600, channels: 3 } }).jpeg({ quality: 95 }).toBuffer()
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`
}

test.describe("Photos & location privacy @db", () => {
  test("feed, photo endpoint, blocking, own photos", async () => {
    test.setTimeout(120_000)
    const ctx = () => playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    const probe = await ctx()
    const ready = (await (await probe.get("/api/ready")).json()) as { mode?: string; database?: string }
    test.skip(ready.mode !== "production" || ready.database !== "ok", "Requires Postgres")

    const viewerApi = await ctx()
    const withPhotoApi = await ctx()
    const noPhotoApi = await ctx()
    const viewer = await registerUserViaApi(viewerApi, createTestUser("ph-v"))
    const withPhoto = await registerUserViaApi(withPhotoApi, createTestUser("ph-a"))
    const noPhoto = await registerUserViaApi(noPhotoApi, createTestUser("ph-b"))
    const photo = await bigJpegDataUrl()
    const realLat = 52.520008
    const realLng = 13.404954

    await withDb(async (sql) => {
      await sql`UPDATE users SET email_verified = true WHERE id IN ${sql([viewer.id, withPhoto.id, noPhoto.id])}`
      await sql`UPDATE users SET latitude = 52.5, longitude = 13.4 WHERE id = ${viewer.id}`
      await sql`UPDATE users SET latitude = ${realLat}, longitude = ${realLng},
        profile = COALESCE(profile, '{}'::jsonb) || ${sql.json({ photoUrls: [photo] })} WHERE id = ${withPhoto.id}`
      await sql`UPDATE users SET latitude = ${realLat}, longitude = ${realLng},
        profile = (COALESCE(profile, '{}'::jsonb) - 'photoUrls' - 'photoUrl') WHERE id = ${noPhoto.id}`
    })

    const feedRes = await viewerApi.get("/api/discover?limit=120&maxDistance=500")
    expect(feedRes.ok()).toBeTruthy()
    const feedText = await feedRes.text()
    expect(feedText).not.toContain("data:image")
    expect(feedText).not.toContain(String(realLat))
    const feed = JSON.parse(feedText) as {
      profiles: Array<{ id: string; image: string; images: string[]; lat: number | null; lng: number | null; distanceKm: number | null }>
    }
    const a = feed.profiles.find((p) => p.id === withPhoto.id)
    const b = feed.profiles.find((p) => p.id === noPhoto.id)
    expect(a, "profile with photo is in the feed").toBeTruthy()
    expect(b, "profile without photo is not in the feed").toBeFalsy()

    // Photo: short URL, resized, viewers only.
    expect(a!.image).toMatch(new RegExp(`^/api/photos/${withPhoto.id}/0\\?v=[0-9a-f]{12}$`))
    const img = await viewerApi.get(a!.image)
    expect(img.status()).toBe(200)
    expect(img.headers()["content-type"]).toBe("image/webp")
    expect(img.headers()["cache-control"]).toContain("private")
    const bytes = (await img.body()).length
    expect(bytes).toBeGreaterThan(1000)
    expect(bytes).toBeLessThan(photo.length)
    const anon = await playwrightRequest.newContext({ baseURL })
    expect((await anon.get(a!.image)).status()).toBe(401)

    // The fallback picture for a missing photo is a real file (the old placeholder path was a 404).
    expect((await probe.get("/images/no-photo.svg")).status()).toBe(200)

    // Location: approximate point (never the stored one), whole-km distance.
    expect(a!.lat).not.toBeNull()
    expect(a!.lat).not.toBe(realLat)
    expect(a!.lng).not.toBe(realLng)
    expect(Math.abs(a!.lat! - realLat)).toBeLessThan(0.03)
    expect(Number.isInteger(a!.distanceKm)).toBeTruthy()

    // Blocking: the photo is no longer served to the blocked person.
    const block = await withPhotoApi.post("/api/v1/block", { data: { blockedUserId: viewer.id, action: "block" } })
    expect(block.ok(), await block.text()).toBeTruthy()
    expect((await viewerApi.get(a!.image)).status()).toBe(404)

    // Owner: short URLs in /api/me; saving the profile with them keeps the stored original.
    const me = (await (await withPhotoApi.get("/api/me")).json()) as { user: { photos: Array<{ url: string }> } }
    expect(me.user.photos[0]?.url).toMatch(/^\/api\/photos\//)
    expect(JSON.stringify(me)).not.toContain("data:image")
    const save = await withPhotoApi.put("/api/user/profile", { data: { profile: { photoUrls: [me.user.photos[0].url], bio: "hi" } } })
    expect(save.ok(), await save.text()).toBeTruthy()
    const stored = await withDb((sql) => sql<{ url: string }[]>`SELECT profile->'photoUrls'->>0 AS url FROM users WHERE id = ${withPhoto.id}`)
    expect(stored[0].url).toBe(photo)

    for (const c of [viewerApi, withPhotoApi, noPhotoApi, probe, anon]) await c.dispose()
  })
})
