import { getDb } from "@/server/db"

export const MAX_USER_PHOTOS = 6

export type DbUserPhotoRow = {
  id: string
  user_id: string
  url: string
  position: number
  is_primary: boolean
  created_at: Date
}

export type DbProfileRow = {
  id: string
  email: string
  name: string
  bio: string | null
  birth_date: Date | null
  profile: Record<string, unknown>
  latitude: number | null
  longitude: number | null
  location_city: string | null
  location_country: string | null
  location_updated_at: Date | null
  gender: "male" | "female" | null
  purpose: string | null
  max_distance: number
  photo_verified: boolean
}

export async function findProfileRow(userId: string): Promise<DbProfileRow | null> {
  const db = getDb()
  if (!db) return null
  const rows = await db<DbProfileRow[]>`
    SELECT
      id, email, name, bio, birth_date, profile,
      latitude, longitude, location_city, location_country, location_updated_at,
      gender, purpose, max_distance, photo_verified
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function findPhotosByUserId(userId: string): Promise<DbUserPhotoRow[]> {
  const db = getDb()
  if (!db) return []
  return db<DbUserPhotoRow[]>`
    SELECT id, user_id, url, position, is_primary, created_at
    FROM user_photos
    WHERE user_id = ${userId}
    ORDER BY position ASC, created_at ASC
  `
}

export async function countPhotosByUserId(userId: string): Promise<number> {
  const db = getDb()
  if (!db) return 0
  const rows = await db<{ count: string }[]>`
    SELECT count(*)::text AS count FROM user_photos WHERE user_id = ${userId}
  `
  return Number(rows[0]?.count ?? 0)
}

export async function updateProfileFields(
  userId: string,
  patch: {
    bio?: string | null
    birthDate?: string | null
    profile?: Record<string, unknown>
    locationCity?: string | null
    locationCountry?: string | null
  }
): Promise<boolean> {
  const db = getDb()
  if (!db) return false

  if (patch.bio !== undefined) {
    await db`UPDATE users SET bio = ${patch.bio} WHERE id = ${userId}`
  }
  if (patch.birthDate !== undefined) {
    await db`UPDATE users SET birth_date = ${patch.birthDate} WHERE id = ${userId}`
  }
  if (patch.locationCity !== undefined) {
    await db`UPDATE users SET location_city = ${patch.locationCity} WHERE id = ${userId}`
  }
  if (patch.locationCountry !== undefined) {
    await db`UPDATE users SET location_country = ${patch.locationCountry} WHERE id = ${userId}`
  }
  if (patch.profile !== undefined) {
    await db`
      UPDATE users SET profile = ${db.json(JSON.parse(JSON.stringify(patch.profile)))}
      WHERE id = ${userId}
    `
  }
  return true
}

export async function updateLocationFields(
  userId: string,
  patch: {
    latitude?: number | null
    longitude?: number | null
    city?: string | null
    country?: string | null
  }
): Promise<boolean> {
  const db = getDb()
  if (!db) return false

  if (patch.latitude !== undefined || patch.longitude !== undefined) {
    await db`
      UPDATE users
      SET
        latitude = ${patch.latitude ?? null},
        longitude = ${patch.longitude ?? null},
        location_updated_at = now()
      WHERE id = ${userId}
    `
  }
  if (patch.city !== undefined) {
    await db`UPDATE users SET location_city = ${patch.city} WHERE id = ${userId}`
  }
  if (patch.country !== undefined) {
    await db`UPDATE users SET location_country = ${patch.country} WHERE id = ${userId}`
  }
  if (patch.city !== undefined || patch.country !== undefined) {
    await db`UPDATE users SET location_updated_at = now() WHERE id = ${userId}`
  }
  return true
}

export async function insertPhoto(
  userId: string,
  input: { url: string; position: number; isPrimary: boolean }
): Promise<DbUserPhotoRow | null> {
  const db = getDb()
  if (!db) return null

  if (input.isPrimary) {
    await db`UPDATE user_photos SET is_primary = false WHERE user_id = ${userId}`
  }

  const rows = await db<DbUserPhotoRow[]>`
    INSERT INTO user_photos (user_id, url, position, is_primary)
    VALUES (${userId}, ${input.url}, ${input.position}, ${input.isPrimary})
    RETURNING id, user_id, url, position, is_primary, created_at
  `
  return rows[0] ?? null
}

export async function deletePhoto(userId: string, photoId: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  const rows = await db<{ id: string; is_primary: boolean }[]>`
    DELETE FROM user_photos
    WHERE id = ${photoId} AND user_id = ${userId}
    RETURNING id, is_primary
  `
  const deleted = rows[0]
  if (!deleted) return false

  if (deleted.is_primary) {
    const next = await db<{ id: string }[]>`
      SELECT id FROM user_photos
      WHERE user_id = ${userId}
      ORDER BY position ASC, created_at ASC
      LIMIT 1
    `
    if (next[0]) {
      await db`UPDATE user_photos SET is_primary = true WHERE id = ${next[0].id}`
    }
  }
  return true
}

export async function syncPhotoUrlsToProfileJson(userId: string): Promise<void> {
  const db = getDb()
  if (!db) return
  const photos = await findPhotosByUserId(userId)
  const urls = photos.map((p) => p.url)
  const row = await findProfileRow(userId)
  if (!row) return
  const merged = { ...(row.profile ?? {}), photoUrls: urls }
  await db`
    UPDATE users SET profile = ${db.json(JSON.parse(JSON.stringify(merged)))}
    WHERE id = ${userId}
  `
}
