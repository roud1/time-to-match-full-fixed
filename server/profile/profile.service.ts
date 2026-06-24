import { getInterestIdsByUser, listAllInterests, syncUserInterests } from "@/server/repositories/interests"
import {
  countPhotosByUserId,
  deletePhoto,
  findPhotosByUserId,
  findProfileRow,
  insertPhoto,
  MAX_USER_PHOTOS,
  syncPhotoUrlsToProfileJson,
  updateLocationFields,
  updateProfileFields,
  type DbUserPhotoRow,
} from "@/server/profile/profile.repository"
import type {
  AddPhotoInput,
  UpdateLocationInput,
  UpdateProfileInput,
  UserLocation,
  UserPhoto,
  UserProfile,
} from "@/server/profile/profile.types"

function readString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined
}

export function computeAgeFromBirthDate(birthDate: Date | string | null | undefined): number | null {
  if (!birthDate) return null
  const birth = birthDate instanceof Date ? birthDate : new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 && age <= 120 ? age : null
}

function formatBirthDate(birthDate: Date | null): string | null {
  if (!birthDate) return null
  return birthDate.toISOString().slice(0, 10)
}

function mapPhoto(row: DbUserPhotoRow): UserPhoto {
  return {
    id: row.id,
    url: row.url,
    position: row.position,
    isPrimary: row.is_primary,
    createdAt: row.created_at.toISOString(),
  }
}

function resolveBio(row: NonNullable<Awaited<ReturnType<typeof findProfileRow>>>): string {
  if (row.bio?.trim()) return row.bio.trim()
  return readString(row.profile.bio) ?? ""
}

function resolveBirthDate(row: NonNullable<Awaited<ReturnType<typeof findProfileRow>>>): string | null {
  if (row.birth_date) return formatBirthDate(row.birth_date)
  return readString(row.profile.birthdate) ?? null
}

function resolveCity(row: NonNullable<Awaited<ReturnType<typeof findProfileRow>>>): string | null {
  if (row.location_city?.trim()) return row.location_city.trim()
  return readString(row.profile.customCity) ?? readString(row.profile.cityId) ?? null
}

async function resolvePhotos(userId: string, profile: Record<string, unknown>): Promise<UserPhoto[]> {
  const rows = await findPhotosByUserId(userId)
  if (rows.length > 0) return rows.map(mapPhoto)

  const legacy = profile.photoUrls
  if (Array.isArray(legacy)) {
    return legacy
      .filter((u): u is string => typeof u === "string" && u.length > 0)
      .map((url, index) => ({
        id: `legacy-${index}`,
        url,
        position: index,
        isPrimary: index === 0,
        createdAt: new Date(0).toISOString(),
      }))
  }
  const single = readString(profile.photoUrl)
  if (single) {
    return [
      {
        id: "legacy-0",
        url: single,
        position: 0,
        isPrimary: true,
        createdAt: new Date(0).toISOString(),
      },
    ]
  }
  return []
}

function buildLocation(row: NonNullable<Awaited<ReturnType<typeof findProfileRow>>>): UserLocation {
  return {
    city: resolveCity(row),
    country: row.location_country?.trim() || null,
    latitude: row.latitude,
    longitude: row.longitude,
    updatedAt: row.location_updated_at?.toISOString() ?? null,
  }
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const row = await findProfileRow(userId)
  if (!row) return null

  const interestIds = await getInterestIdsByUser(userId)
  const catalog = await listAllInterests()
  const interests = catalog.filter((i) => interestIds.includes(i.id))
  const birthDate = resolveBirthDate(row)
  const photos = await resolvePhotos(userId, row.profile ?? {})

  return {
    id: row.id,
    displayName: row.name,
    email: row.email,
    bio: resolveBio(row),
    birthDate,
    age: computeAgeFromBirthDate(birthDate),
    interests,
    interestIds,
    interestSlugs: interests.map((i) => i.slug).filter((s): s is string => Boolean(s)),
    photos,
    location: buildLocation(row),
    gender: row.gender,
    purpose: row.purpose,
    maxDistance: row.max_distance,
    photoVerified: row.photo_verified,
  }
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile | null> {
  const row = await findProfileRow(userId)
  if (!row) return null

  const mergedProfile = { ...(row.profile ?? {}) }
  const patch: Parameters<typeof updateProfileFields>[1] = {}

  if (input.bio !== undefined) {
    patch.bio = input.bio.trim() || null
    mergedProfile.bio = input.bio.trim()
  }
  if (input.birthDate !== undefined) {
    patch.birthDate = input.birthDate
    if (input.birthDate) mergedProfile.birthdate = input.birthDate
    else delete mergedProfile.birthdate
  }

  patch.profile = mergedProfile
  await updateProfileFields(userId, patch)

  if (input.interestIds !== undefined) {
    await syncUserInterests(userId, input.interestIds)
  }

  return getProfile(userId)
}

export async function listPhotos(userId: string): Promise<UserPhoto[]> {
  const row = await findProfileRow(userId)
  if (!row) return []
  return resolvePhotos(userId, row.profile ?? {})
}

export async function addPhoto(userId: string, input: AddPhotoInput): Promise<UserPhoto | null> {
  const url = input.url.trim()
  if (!url) return null

  const count = await countPhotosByUserId(userId)
  if (count >= MAX_USER_PHOTOS) return null

  const isPrimary = input.isPrimary ?? count === 0
  const row = await insertPhoto(userId, {
    url,
    position: count,
    isPrimary,
  })
  if (!row) return null

  await syncPhotoUrlsToProfileJson(userId)
  return mapPhoto(row)
}

export async function removePhoto(userId: string, photoId: string): Promise<boolean> {
  const ok = await deletePhoto(userId, photoId)
  if (!ok) return false
  await syncPhotoUrlsToProfileJson(userId)
  return true
}

export async function setLocation(userId: string, input: UpdateLocationInput): Promise<UserProfile | null> {
  const row = await findProfileRow(userId)
  if (!row) return null

  await updateLocationFields(userId, input)

  const mergedProfile = { ...(row.profile ?? {}) }
  if (input.city !== undefined) {
    mergedProfile.customCity = input.city ?? undefined
    if (input.city) delete mergedProfile.cityId
  }
  await updateProfileFields(userId, {
    locationCity: input.city,
    locationCountry: input.country,
    profile: mergedProfile,
  })

  return getProfile(userId)
}
