/**
 * Photos of OTHER people as they leave the API.
 *
 * Without S3/R2 (the free setup) a photo is stored as a data URL inside users.profile.photoUrls —
 * often several MB each. Putting those strings into feed / likes / match JSON made every response
 * huge and slow, and the cards rendered empty when they timed out. Instead:
 *  - SQL returns a short marker `data-md5:<hash>` instead of the data URL (see `photoRefSql`);
 *  - the API returns `/api/photos/<userId>/<index>?v=<hash>`, served by `api/handlers/photos`
 *    (signed-in users only, resized, cacheable);
 *  - http(s) CDN URLs and bundled `/demo/...` files pass through unchanged;
 *  - no photo → the bundled neutral `NO_PHOTO_URL` picture (an outline, not a person), never a
 *    path that does not exist (the old `/placeholder-profile.jpg` 404 left cards empty).
 */
import { createHash } from "node:crypto"

const MARKER = "data-md5:"

/** Shown for a profile without photos (public/images/no-photo.svg). */
export const NO_PHOTO_URL = "/images/no-photo.svg"

/** SQL expression (text) for one stored photo value: data URLs become `data-md5:<md5>`. */
export function photoRefSql(expr: string): string {
  return `(CASE WHEN (${expr}) LIKE 'data:%' THEN '${MARKER}' || md5(${expr}) ELSE NULLIF(${expr}, '') END)`
}

/**
 * SQL (json array) of all photo refs of the users row `alias`, in stored order (index = position in
 * profile.photoUrls; a lone legacy profile.photoUrl is index 0).
 */
export function photoRefsArraySql(alias: string): string {
  const arr = `CASE WHEN jsonb_typeof(${alias}.profile->'photoUrls') = 'array' THEN ${alias}.profile->'photoUrls' ELSE '[]'::jsonb END`
  return `(CASE WHEN jsonb_array_length(${arr}) > 0
      THEN (SELECT json_agg(${photoRefSql("t.v")} ORDER BY t.ord) FROM jsonb_array_elements_text(${arr}) WITH ORDINALITY AS t(v, ord))
      ELSE json_build_array(${photoRefSql(`${alias}.profile->>'photoUrl'`)}) END)`
}

/** SQL (text) of the first photo ref of `alias` (profile JSON, then the user_photos table). */
export function primaryPhotoRefSql(alias: string): string {
  return `COALESCE(${photoRefSql(`${alias}.profile->'photoUrls'->>0`)}, ${photoRefSql(`${alias}.profile->>'photoUrl'`)},
    (SELECT p.url FROM user_photos p WHERE p.user_id = ${alias}.id ORDER BY p.is_primary DESC, p.position ASC LIMIT 1))`
}

/** Public URL for one stored photo (raw value or SQL marker) of `userId` at `index`. */
export function toPublicPhotoUrl(userId: string, index: number, ref: unknown): string | null {
  if (typeof ref !== "string") return null
  const value = ref.trim()
  if (!value) return null
  let version: string | null = null
  if (value.startsWith(MARKER)) version = value.slice(MARKER.length, MARKER.length + 12)
  else if (value.startsWith("data:")) version = createHash("md5").update(value).digest("hex").slice(0, 12)
  if (version) return `/api/photos/${userId}/${index}?v=${version}`
  if (value.startsWith("/") || value.startsWith("https://") || value.startsWith("http://")) return value
  return null
}

/** All public photo URLs of `userId` from a list of stored values (empty entries dropped). */
export function toPublicPhotoUrls(userId: string, refs: unknown): string[] {
  if (!Array.isArray(refs)) return []
  const out: string[] = []
  refs.forEach((ref, index) => {
    const url = toPublicPhotoUrl(userId, index, ref)
    if (url) out.push(url)
  })
  return out
}

const OWN_URL = /^\/api\/photos\/([0-9a-f-]{36})\/(\d{1,2})(?:\?.*)?$/i

/**
 * The owner gets their own photos as `/api/photos/...` URLs too (see /api/me), and the app sends
 * that list back when the profile is saved. Map each such URL back to the value stored at that
 * index, so saving never replaces a photo with a link to itself. Links to other people's photos
 * and anything unknown are dropped.
 */
export function restoreOwnPhotoRefs(userId: string, incoming: unknown, stored: unknown): unknown {
  if (!Array.isArray(incoming)) return incoming
  const current = Array.isArray(stored) ? stored : []
  const out: string[] = []
  for (const item of incoming) {
    if (typeof item !== "string" || !item.trim()) continue
    const m = OWN_URL.exec(item.trim())
    if (!m) {
      out.push(item)
      continue
    }
    if (m[1].toLowerCase() !== userId.toLowerCase()) continue
    const original = current[Number(m[2])]
    if (typeof original === "string" && original) out.push(original)
  }
  return out
}
