import type { StoredUserProfile } from "@/lib/user-profile"

export const MAX_PROFILE_PHOTOS = 6

export function getProfilePhotos(
  profile: Pick<StoredUserProfile, "photoUrls" | "photoUrl">
): string[] {
  if (profile.photoUrls?.length) return profile.photoUrls
  if (profile.photoUrl) return [profile.photoUrl]
  return []
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function filesToDataUrls(files: File[]): Promise<string[]> {
  return Promise.all(files.map(readFileAsDataUrl))
}

export function mergePhotos(current: string[], added: string[]): string[] {
  const room = MAX_PROFILE_PHOTOS - current.length
  if (room <= 0) return current
  return [...current, ...added.slice(0, room)]
}
