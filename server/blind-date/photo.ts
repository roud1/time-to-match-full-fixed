/**
 * Progressive Reveal: the server renders a degraded copy of the person's main photo for the
 * reveal stage both people agreed to. The original URL / file never reaches the other person
 * before 100 %, and lower stages are produced from a tiny downscale, so the detail is not in the
 * bytes at all (unlike a CSS blur).
 */

import { readFile } from "node:fs/promises"
import path from "node:path"
import { getDb } from "@/server/db"
import { isPhotoUrlAllowed } from "@/server/photos/url-validation"
import type { RevealStage } from "@/server/blind-date/rules"

const MAX_SOURCE_BYTES = 8 * 1024 * 1024

/** Main photo reference of a user (first of profile.photoUrls, then user_photos). */
export async function primaryPhotoRef(userId: string): Promise<string | null> {
  const sql = getDb()
  if (!sql) return null
  const [row] = await sql<{ urls: unknown; single: string | null; table_url: string | null }[]>`
    SELECT profile->'photoUrls' AS urls, profile->>'photoUrl' AS single,
      (SELECT url FROM user_photos p WHERE p.user_id = u.id ORDER BY is_primary DESC, position ASC LIMIT 1) AS table_url
    FROM users u WHERE u.id = ${userId}
  `
  if (!row) return null
  if (Array.isArray(row.urls)) {
    const first = row.urls.find((u): u is string => typeof u === "string" && u.length > 0)
    if (first) return first
  }
  return row.single || row.table_url || null
}

/** Reads the image bytes: data URL, a file under /public, or an allowlisted photo host. */
export async function loadPhotoBytes(ref: string): Promise<Buffer | null> {
  if (ref.startsWith("data:image/")) {
    const comma = ref.indexOf(",")
    if (comma < 0 || !ref.slice(0, comma).includes(";base64")) return null
    const buf = Buffer.from(ref.slice(comma + 1), "base64")
    return buf.length > 0 && buf.length <= MAX_SOURCE_BYTES ? buf : null
  }
  if (ref.startsWith("/") && !ref.startsWith("//")) {
    const publicDir = path.join(process.cwd(), "public")
    const file = path.normalize(path.join(publicDir, decodeURIComponent(ref.split("?")[0])))
    if (!file.startsWith(publicDir + path.sep)) return null
    try {
      return await readFile(file)
    } catch {
      return null
    }
  }
  if (!isPhotoUrlAllowed(ref)) return null
  try {
    const res = await fetch(ref, { redirect: "error", signal: AbortSignal.timeout(8000) })
    if (!res.ok || !(res.headers.get("content-type") ?? "").startsWith("image/")) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.length <= MAX_SOURCE_BYTES ? buf : null
  } catch {
    return null
  }
}

/** Downscale width (the information kept) and blur for each stage. */
const STAGE_RENDER: Record<Exclude<RevealStage, 0>, { sample: number; blur: number }> = {
  25: { sample: 10, blur: 22 },
  50: { sample: 20, blur: 12 },
  75: { sample: 48, blur: 5 },
  100: { sample: 0, blur: 0 },
}

const OUTPUT_WIDTH = 480

export async function renderRevealImage(source: Buffer, stage: Exclude<RevealStage, 0>): Promise<Buffer> {
  const { default: sharp } = await import("sharp")
  const { sample, blur } = STAGE_RENDER[stage]
  const base = sharp(source, { failOn: "none" }).rotate().resize(OUTPUT_WIDTH, Math.round(OUTPUT_WIDTH * 1.25), { fit: "cover" })
  if (stage === 100) {
    return base.jpeg({ quality: 82 }).toBuffer()
  }
  // Keep only `sample` pixels across, then scale back up and blur: the detail is gone for good.
  const tiny = await base.resize(sample, Math.round(sample * 1.25), { fit: "fill" }).toBuffer()
  return sharp(tiny)
    .resize(OUTPUT_WIDTH, Math.round(OUTPUT_WIDTH * 1.25), { kernel: "cubic" })
    .blur(blur)
    .modulate({ saturation: 1.1 })
    .jpeg({ quality: 70 })
    .toBuffer()
}
