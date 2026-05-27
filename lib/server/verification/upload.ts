import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomBytes } from "node:crypto"

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"])

export async function saveVerificationSelfie(
  userId: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED.has(file.type)) {
    return { error: "invalid_file_type" }
  }
  if (file.size > MAX_BYTES) {
    return { error: "file_too_large" }
  }

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
  const safeUser = userId.replace(/[^a-zA-Z0-9-]/g, "")
  const name = `${safeUser}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`
  const dir = path.join(process.cwd(), "public", "uploads", "verification")
  await mkdir(dir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(dir, name), buffer)

  return { url: `/uploads/verification/${name}` }
}
