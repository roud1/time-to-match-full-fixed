import type { Interest } from "@/client/lib/interests/types"

export type UserPhoto = {
  id: string
  url: string
  position: number
  isPrimary: boolean
  createdAt: string
}

export type UserLocation = {
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  updatedAt: string | null
}

export type UserProfile = {
  id: string
  displayName: string
  email: string
  bio: string
  birthDate: string | null
  age: number | null
  interests: Interest[]
  interestIds: number[]
  interestSlugs: string[]
  photos: UserPhoto[]
  location: UserLocation
  gender: "male" | "female" | null
  purpose: string | null
  maxDistance: number
  photoVerified: boolean
}

export type UpdateProfileInput = {
  bio?: string
  birthDate?: string | null
  interestIds?: number[]
}

export type UpdateLocationInput = {
  latitude?: number | null
  longitude?: number | null
  city?: string | null
  country?: string | null
}

export type AddPhotoInput = {
  url: string
  isPrimary?: boolean
}
