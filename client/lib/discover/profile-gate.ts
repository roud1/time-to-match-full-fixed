import type { User } from "@/client/lib/user/types"
import { getUserProfile } from "@/client/lib/user-profile"

export type DiscoverProfileGateStatus = {
  complete: boolean
  missing: Array<"photo" | "gender" | "city">
}

export function assessDiscoverProfileReadiness(
  user: Pick<User, "gender" | "photos" | "location"> | ReturnType<typeof getUserProfile> | null
): DiscoverProfileGateStatus {
  const missing: DiscoverProfileGateStatus["missing"] = []

  const photos =
    user && "photos" in user && user.photos
      ? user.photos
      : getUserProfile()?.photoUrls

  const hasPhoto = Array.isArray(photos)
    ? photos.some((p) => (typeof p === "string" ? p : p?.url)?.trim())
    : Boolean(getUserProfile()?.photoUrl?.trim())

  const gender =
    user && "gender" in user ? user.gender : getUserProfile()?.gender ?? null

  const city =
    user && "location" in user
      ? user.location?.city
      : getUserProfile()?.customCity ?? getUserProfile()?.cityId

  if (!hasPhoto) missing.push("photo")
  if (gender !== "male" && gender !== "female") missing.push("gender")
  if (!city?.trim()) missing.push("city")

  return { complete: missing.length === 0, missing }
}
