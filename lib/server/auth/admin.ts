import { getServerEnv } from "@/lib/server/env"

/** Admin API via `x-admin-key` header (set ADMIN_API_KEY in env). */
export function isAdminRequest(request: Request): boolean {
  const key = process.env.ADMIN_API_KEY
  if (!key || key.length < 8) return false
  const header = request.headers.get("x-admin-key")
  return header === key
}

export function adminNotConfigured(): boolean {
  return !process.env.ADMIN_API_KEY
}
