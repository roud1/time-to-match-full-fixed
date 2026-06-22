/**
 * Client-side photo upload — presigned S3/R2 when configured, base64 fallback otherwise.
 */

export type PhotoUploadMode = "s3" | "local"

let cachedMode: PhotoUploadMode | null = null

export async function getPhotoUploadMode(): Promise<PhotoUploadMode> {
  if (cachedMode) return cachedMode
  try {
    const res = await fetch("/api/user/photos/upload-url", { credentials: "include" })
    if (!res.ok) {
      cachedMode = "local"
      return cachedMode
    }
    const data = (await res.json()) as { configured?: boolean }
    cachedMode = data.configured ? "s3" : "local"
    return cachedMode
  } catch {
    cachedMode = "local"
    return cachedMode
  }
}

export function resetPhotoUploadModeCache(): void {
  cachedMode = null
}

export async function uploadPhotoFile(file: File): Promise<string> {
  const contentType = file.type || "image/jpeg"

  const presignRes = await fetch("/api/user/photos/upload-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType }),
  })

  if (!presignRes.ok) {
    return readFileAsDataUrl(file)
  }

  const presign = (await presignRes.json()) as {
    configured?: boolean
    mode?: string
    uploadUrl?: string
    publicUrl?: string
  }

  if (!presign.configured || presign.mode !== "s3" || !presign.uploadUrl || !presign.publicUrl) {
    return readFileAsDataUrl(file)
  }

  const putRes = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  })

  if (!putRes.ok) {
    return readFileAsDataUrl(file)
  }

  cachedMode = "s3"
  return presign.publicUrl
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function uploadPhotoFiles(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadPhotoFile))
}
