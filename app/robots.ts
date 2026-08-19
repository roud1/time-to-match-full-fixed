import type { MetadataRoute } from "next"

const BASE = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://timetomatch.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/story", "/register", "/login", "/privacy", "/terms"],
        disallow: ["/admin", "/api/", "/app/", "/settings", "/profile", "/billing"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
