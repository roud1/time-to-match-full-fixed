/**
 * Client-side photo upload — presigned S3/R2 when configured, base64 fallback otherwise.
 */

export type PhotoUploadMode = "s3" | "local"

export type PhotoUploadResult = {
  url: string
  mode: PhotoUploadMode
  usedFallback: boolean
}

let cachedMode: PhotoUploadMode | null = null
let cachedConfigured: boolean | null = null

export async function getPhotoUploadMode(): Promise<PhotoUploadMode> {
  if (cachedMode) return cachedMode
  try {
    const res = await fetch("/api/user/photos/upload-url", { credentials: "include" })
    if (!res.ok) {
      cachedMode = "local"
      cachedConfigured = false
      return cachedMode
    }
    const data = (await res.json()) as { configured?: boolean }
    cachedConfigured = Boolean(data.configured)
    cachedMode = data.configured ? "s3" : "local"
    return cachedMode
  } catch {
    cachedMode = "local"
    cachedConfigured = false
    return cachedMode
  }
}

export async function isPhotoS3Configured(): Promise<boolean> {
  if (cachedConfigured != null) return cachedConfigured
  await getPhotoUploadMode()
  return cachedConfigured ?? false
}

export function resetPhotoUploadModeCache(): void {
  cachedMode = null
  cachedConfigured = null
}

/** Longest side of an uploaded photo: sharp on any phone screen, a fraction of a camera original. */
const MAX_PHOTO_SIDE = 1280
const PHOTO_QUALITY = 0.82

/**
 * Shrinks a camera photo (often 3–8 MB) before it leaves the phone. Without S3 the photo is stored
 * inline in the profile, so an original made every profile load slow. EXIF orientation is
 * applied; on any failure the original file is used.
 */
export async function downscalePhotoFile(file: File): Promise<File> {
  if (typeof window === "undefined" || typeof createImageBitmap !== "function") return file
  if (!/^image\/(jpeg|jpg|png|webp|heic|heif|avif)$/i.test(file.type || "image/jpeg")) return file
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
    const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      bitmap.close()
      return file
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", PHOTO_QUALITY))
    if (!blob || (scale === 1 && blob.size >= file.size)) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" })
  } catch {
    return file
  }
}

export async function uploadPhotoFile(original: File): Promise<PhotoUploadResult> {
  const file = await downscalePhotoFile(original)
  const contentType = file.type || "image/jpeg"

  const presignRes = await fetch("/api/user/photos/upload-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType }),
  })

  if (!presignRes.ok) {
    const url = await readFileAsDataUrl(file)
    return { url, mode: "local", usedFallback: true }
  }

  const presign = (await presignRes.json()) as {
    configured?: boolean
    mode?: string
    uploadUrl?: string
    publicUrl?: string
  }

  if (!presign.configured || presign.mode !== "s3" || !presign.uploadUrl || !presign.publicUrl) {
    cachedConfigured = false
    cachedMode = "local"
    const url = await readFileAsDataUrl(file)
    return { url, mode: "local", usedFallback: true }
  }

  const putRes = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  })

  if (!putRes.ok) {
    const url = await readFileAsDataUrl(file)
    return { url, mode: "local", usedFallback: true }
  }

  cachedMode = "s3"
  cachedConfigured = true
  return { url: presign.publicUrl, mode: "s3", usedFallback: false }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function uploadPhotoFiles(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<PhotoUploadResult[]> {
  const results: PhotoUploadResult[] = []
  for (let i = 0; i < files.length; i++) {
    const result = await uploadPhotoFile(files[i])
    results.push(result)
    onProgress?.(i + 1, files.length)
  }
  return results
}
