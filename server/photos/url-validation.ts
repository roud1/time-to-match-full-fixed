/**
 * Validates photo URLs against an allowlisted CDN host (PHOTO_CDN_HOST / S3_PUBLIC_URL).
 * Demo mode without allowlist permits http(s) URLs for local development.
 */

function readAllowedHosts(): Set<string> {
  const hosts = new Set<string>()
  const explicit = process.env.PHOTO_CDN_HOST?.trim()
  if (explicit) {
    for (const part of explicit.split(",")) {
      const h = part.trim().toLowerCase()
      if (h) hosts.add(h)
    }
  }

  const publicUrl = process.env.S3_PUBLIC_URL?.trim() || process.env.AWS_S3_PUBLIC_URL?.trim()
  if (publicUrl) {
    try {
      hosts.add(new URL(publicUrl).host.toLowerCase())
    } catch {
      /* ignore */
    }
  }

  return hosts
}

export function isPhotoUrlAllowed(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return false
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false

  const hosts = readAllowedHosts()
  if (hosts.size === 0) {
    return process.env.NODE_ENV !== "production"
  }

  const host = parsed.host.toLowerCase()
  return hosts.has(host)
}

export function photoUrlValidationError(): string {
  const hosts = [...readAllowedHosts()]
  if (hosts.length === 0) {
    return "Photo URL not allowed. Configure PHOTO_CDN_HOST for production uploads."
  }
  return `Photo URL must be hosted on: ${hosts.join(", ")}`
}
