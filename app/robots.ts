import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export default function robots(): MetadataRoute.Robots {
  const host = siteUrl.replace(/\/$/, "")
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/app", "/settings", "/notifications", "/memories"],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
  }
}
