import type { MetadataRoute } from "next"

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

const routes = [
  { path: "", priority: 1, changeFrequency: "daily" as const },
  { path: "/login", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/register", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/forgot-password", priority: 0.3, changeFrequency: "yearly" as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const host = baseUrl().replace(/\/$/, "")
  const now = new Date()
  return routes.map(({ path, priority, changeFrequency }) => ({
    url: path === "" ? `${host}/` : `${host}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
