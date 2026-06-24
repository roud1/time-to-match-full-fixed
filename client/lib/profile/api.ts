import type { Interest } from "@/client/lib/interests/types"
import {
  getAgeFromBirthdate,
  getUserProfile,
  updateUserProfile,
  type StoredUserProfile,
} from "@/client/lib/user-profile"
import { getProfilePhotos } from "@/client/lib/profile-photos"

export type ProfilePhoto = {
  id: string
  url: string
  position: number
  isPrimary: boolean
  createdAt?: string
}

export type ProfileLocation = {
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  updatedAt: string | null
}

export type UserProfilePayload = {
  id: string
  displayName: string
  email: string
  bio: string
  birthDate: string | null
  age: number | null
  interests: Interest[]
  interestIds: number[]
  interestSlugs: string[]
  photos: ProfilePhoto[]
  location: ProfileLocation
  gender?: "male" | "female" | null
  purpose?: string | null
  maxDistance?: number
  photoVerified?: boolean
}

export type ProfileResponse = {
  profile: UserProfilePayload
}

function localDemoProfile(): UserProfilePayload | null {
  const p = getUserProfile()
  if (!p) return null
  const photos = getProfilePhotos(p).map((url, index) => ({
    id: `local-${index}`,
    url,
    position: index,
    isPrimary: index === 0,
  }))
  const city = p.customCity?.trim() || p.cityId || null
  return {
    id: "local",
    displayName: p.name,
    email: p.email,
    bio: p.bio,
    birthDate: p.birthdate ?? null,
    age: getAgeFromBirthdate(p.birthdate),
    interests: [],
    interestIds: p.dbInterestIds ?? [],
    interestSlugs: [],
    photos,
    location: {
      city,
      country: null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      updatedAt: null,
    },
    purpose: p.purpose ?? null,
    maxDistance: p.maxDistance,
  }
}

function applyProfileToLocal(profile: UserProfilePayload): StoredUserProfile | null {
  const patch: Partial<StoredUserProfile> = {
    bio: profile.bio,
    birthdate: profile.birthDate ?? undefined,
    photoUrls: profile.photos.map((ph) => ph.url),
    dbInterestIds: profile.interestIds,
    latitude: profile.location.latitude ?? undefined,
    longitude: profile.location.longitude ?? undefined,
    purpose: profile.purpose as StoredUserProfile["purpose"],
    maxDistance: profile.maxDistance,
  }
  if (profile.location.city) {
    patch.customCity = profile.location.city
  }
  return updateUserProfile(patch)
}

export async function fetchProfile(): Promise<UserProfilePayload | null> {
  try {
    const res = await fetch("/api/profile", { credentials: "include", cache: "no-store" })
    if (res.status === 503) return localDemoProfile()
    if (!res.ok) return res.status === 401 ? null : localDemoProfile()
    const data = (await res.json()) as ProfileResponse
    applyProfileToLocal(data.profile)
    return data.profile
  } catch {
    return localDemoProfile()
  }
}

export async function patchProfile(body: {
  bio?: string
  birthDate?: string | null
  interestIds?: number[]
}): Promise<UserProfilePayload | null> {
  try {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.status === 503) {
      applyProfileToLocal({
        ...(localDemoProfile() ?? {
          id: "local",
          displayName: "",
          email: "",
          bio: "",
          birthDate: null,
          age: null,
          interests: [],
          interestIds: [],
          interestSlugs: [],
          photos: [],
          location: { city: null, country: null, latitude: null, longitude: null, updatedAt: null },
        }),
        ...body,
        bio: body.bio ?? "",
        birthDate: body.birthDate ?? null,
        interestIds: body.interestIds ?? [],
      } as UserProfilePayload)
      return localDemoProfile()
    }
    if (!res.ok) return null
    const data = (await res.json()) as ProfileResponse
    applyProfileToLocal(data.profile)
    return data.profile
  } catch {
    return null
  }
}

export async function fetchProfilePhotos(): Promise<ProfilePhoto[]> {
  try {
    const res = await fetch("/api/profile/photos", { credentials: "include", cache: "no-store" })
    if (!res.ok) {
      const demo = localDemoProfile()
      return demo?.photos ?? []
    }
    const data = (await res.json()) as { photos?: ProfilePhoto[] }
    return data.photos ?? []
  } catch {
    return localDemoProfile()?.photos ?? []
  }
}

export async function addProfilePhoto(url: string, isPrimary?: boolean): Promise<ProfilePhoto | null> {
  try {
    const res = await fetch("/api/profile/photos", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, isPrimary }),
    })
    if (res.status === 503) {
      const p = getUserProfile()
      if (!p) return null
      const current = getProfilePhotos(p)
      const next = [...current, url].slice(0, 6)
      updateUserProfile({ photoUrls: next })
      return { id: `local-${next.length - 1}`, url, position: next.length - 1, isPrimary: next.length === 1 }
    }
    if (!res.ok) return null
    const data = (await res.json()) as { photo?: ProfilePhoto }
    if (data.photo) {
      const p = getUserProfile()
      if (p) {
        const next = [...getProfilePhotos(p), data.photo.url].slice(0, 6)
        updateUserProfile({ photoUrls: next })
      }
    }
    return data.photo ?? null
  } catch {
    return null
  }
}

export async function deleteProfilePhoto(photoId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/profile/photos/${encodeURIComponent(photoId)}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.status === 503) {
      const p = getUserProfile()
      if (!p) return false
      const idx = Number(photoId.replace("local-", ""))
      const current = getProfilePhotos(p)
      if (!Number.isFinite(idx)) return false
      updateUserProfile({ photoUrls: current.filter((_, i) => i !== idx) })
      return true
    }
    if (!res.ok) return false
    await fetchProfilePhotos().then((photos) => {
      updateUserProfile({ photoUrls: photos.map((ph) => ph.url) })
    })
    return true
  } catch {
    return false
  }
}

export async function patchProfileLocation(body: {
  latitude?: number | null
  longitude?: number | null
  city?: string | null
  country?: string | null
}): Promise<ProfileLocation | null> {
  try {
    const res = await fetch("/api/profile/location", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.status === 503) {
      updateUserProfile({
        latitude: body.latitude ?? undefined,
        longitude: body.longitude ?? undefined,
        customCity: body.city ?? undefined,
      })
      const demo = localDemoProfile()
      return demo?.location ?? null
    }
    if (!res.ok) return null
    const data = (await res.json()) as { location?: ProfileLocation }
    if (data.location) {
      updateUserProfile({
        latitude: data.location.latitude ?? undefined,
        longitude: data.location.longitude ?? undefined,
        customCity: data.location.city ?? undefined,
      })
    }
    return data.location ?? null
  } catch {
    return null
  }
}

/** Sync full edit form to profile API (server + demo fallback). */
export async function syncProfileFormToServer(input: {
  bio: string
  birthdate?: string
  dbInterestIds: number[]
  photoUrls: string[]
  latitude?: number | null
  longitude?: number | null
  city?: string | null
}): Promise<void> {
  await patchProfile({
    bio: input.bio.trim(),
    birthDate: input.birthdate ?? null,
    interestIds: input.dbInterestIds,
  })

  if (
    input.latitude !== undefined ||
    input.longitude !== undefined ||
    input.city !== undefined
  ) {
    await patchProfileLocation({
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      city: input.city ?? null,
    })
  }

  const existing = await fetchProfilePhotos()
  const existingUrls = new Set(existing.map((p) => p.url))
  for (const url of input.photoUrls) {
    if (!existingUrls.has(url)) {
      await addProfilePhoto(url, existing.length === 0)
    }
  }
}
