import type { MetadataRoute } from "next"

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export default function robots(): MetadataRoute.Robots {
  const host = baseUrl()
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${host.replace(/\/$/, "")}/sitemap.xml`,
  }
}
