/**
 * Verification selfies are private: only moderators may see them.
 *
 * They used to be written to public/uploads/verification — any file under public/ is served to
 * anyone who has the link, and Render's disk is wiped on every deploy (pending requests then
 * pointed at missing files). Now the selfie is resized and kept in the database
 * (verification_requests.selfie_url as a data URL) and served only by
 * GET /api/admin/verification/:id/selfie to admins.
 */
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_SIDE = 900

export async function saveVerificationSelfie(
  userId: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  void userId
  if (!ALLOWED.has(file.type)) {
    return { error: "invalid_file_type" }
  }
  if (file.size > MAX_BYTES) {
    return { error: "file_too_large" }
  }
  const source = Buffer.from(await file.arrayBuffer())
  try {
    const { default: sharp } = await import("sharp")
    const jpeg = await sharp(source, { failOn: "none" })
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()
    return { url: `data:image/jpeg;base64,${jpeg.toString("base64")}` }
  } catch {
    return { error: "invalid_file_type" }
  }
}

/** Public-safe reference for a stored selfie: never the data itself. */
export function selfieEndpoint(requestId: string): string {
  return `/api/admin/verification/${requestId}/selfie`
}
