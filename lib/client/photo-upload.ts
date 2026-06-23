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

export async function uploadPhotoFile(file: File): Promise<PhotoUploadResult> {
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
