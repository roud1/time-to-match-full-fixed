import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { getDb } from "@/server/db"
import { loadPhotoBytes } from "@/server/blind-date/photo"

export const runtime = "nodejs"

/** Output size: enough for a full-screen card on a phone, a fraction of a camera original. */
const MAX_WIDTH = 1080
const CACHE_MAX = 60
/** Small in-memory cache of resized photos (the free server re-encoding on every view is slow). */
const cache = new Map<string, Buffer>()

function remember(key: string, buf: Buffer) {
  cache.delete(key)
  cache.set(key, buf)
  while (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
}

function notFound() {
  return new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } })
}

/**
 * GET /api/photos/:userId/:index — one profile photo of a user, for signed-in viewers.
 * Not served when either person blocked the other, when the account is inactive, or while a
 * blind date between them has not reached the full photo reveal.
 */
export async function getPhoto(request: Request, ctx: { params: Promise<{ userId: string; index: string }> }) {
  if (!getServerEnv().isDatabaseConfigured) return notFound()
  const session = await getSessionFromRequest()
  if (!session) {
    return new Response(null, { status: 401, headers: { "Cache-Control": "private, no-store" } })
  }
  const { userId, index: rawIndex } = await ctx.params
  const index = Number(rawIndex)
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !Number.isInteger(index) || index < 0 || index > 11) return notFound()

  const sql = getDb()
  if (!sql) return notFound()
  const viewer = session.sub
  const [row] = await sql<{ ref: string | null; allowed: boolean }[]>`
    SELECT
      COALESCE(NULLIF(u.profile->'photoUrls'->>${index}::int, ''),
        CASE WHEN ${index}::int = 0 THEN NULLIF(u.profile->>'photoUrl', '') END) AS ref,
      (u.id = ${viewer}::uuid OR (
        u.is_active = true
        AND COALESCE(u.is_blocked, false) = false
        AND NOT EXISTS (
          SELECT 1 FROM user_blocks b
          WHERE (b.blocker_id = ${viewer}::uuid AND b.blocked_id = u.id)
             OR (b.blocker_id = u.id AND b.blocked_id = ${viewer}::uuid)
        )
        AND COALESCE((
          SELECT r.reveal_level >= 100 FROM blind_date_rooms r
          WHERE (r.user_a = u.id AND r.user_b = ${viewer}::uuid) OR (r.user_b = u.id AND r.user_a = ${viewer}::uuid)
          ORDER BY r.started_at DESC LIMIT 1
        ), true)
      )) AS allowed
    FROM users u WHERE u.id = ${userId}::uuid
  `
  if (!row?.allowed || !row.ref) return notFound()

  const etag = `"${(new URL(request.url).searchParams.get("v") ?? "").replace(/[^0-9a-f]/gi, "").slice(0, 12)}-${index}"`
  const headers = {
    "Content-Type": "image/webp",
    // Private: never stored by shared caches; the URL changes (?v=) when the photo changes.
    "Cache-Control": "private, max-age=604800, immutable",
    ETag: etag,
    "X-Content-Type-Options": "nosniff",
  }
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers })

  const key = `${userId}:${index}:${row.ref.length}:${row.ref.slice(-24)}`
  let out = cache.get(key)
  if (!out) {
    const source = await loadPhotoBytes(row.ref)
    if (!source) return notFound()
    try {
      const { default: sharp } = await import("sharp")
      out = await sharp(source, { failOn: "none" })
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
    } catch {
      return notFound()
    }
    remember(key, out)
  }
  return new Response(new Uint8Array(out), { status: 200, headers })
}
