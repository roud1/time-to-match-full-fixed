import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */

// Build remotePatterns from env so S3/R2/CDN photos work in production.
// Reads: S3_PUBLIC_URL, PHOTO_CDN_HOST, AWS_S3_PUBLIC_URL (any combination)
function buildRemotePatterns() {
  const patterns = [
    // Always allow Unsplash (demo/placeholder images)
    { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
  ]

  const extraHosts = [
    process.env.S3_PUBLIC_URL,
    process.env.AWS_S3_PUBLIC_URL,
    process.env.PHOTO_CDN_HOST,
  ]
    .filter(Boolean)
    .map((raw) => {
      try {
        // Accept full URLs (https://...) or bare hostnames
        const url = raw.startsWith("http") ? new URL(raw) : new URL(`https://${raw}`)
        return url.hostname
      } catch {
        return null
      }
    })
    .filter(Boolean)

  for (const hostname of new Set(extraHosts)) {
    patterns.push({ protocol: "https", hostname, pathname: "/**" })
  }

  return patterns
}

const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ["postgres", "bcryptjs"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [128, 256, 384],
    remotePatterns: buildRemotePatterns(),
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: false,
})
