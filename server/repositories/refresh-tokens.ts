import { createHash, randomBytes } from "crypto"
import { getDb } from "@/server/db"

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString("base64url")
}

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000

export async function insertRefreshToken(input: {
  userId: string
  rawToken: string
  userAgent?: string | null
  ip?: string | null
  ttlMs?: number
}): Promise<void> {
  const db = getDb()
  if (!db) throw new Error("database_unavailable")

  const tokenHash = hashRefreshToken(input.rawToken)
  const expiresAt = new Date(Date.now() + (input.ttlMs ?? REFRESH_TTL_MS))

  await db`
    INSERT INTO user_refresh_tokens (user_id, token_hash, expires_at, user_agent, ip)
    VALUES (${input.userId}, ${tokenHash}, ${expiresAt}, ${input.userAgent ?? null}, ${input.ip ?? null})
  `
}

export async function consumeRefreshToken(
  rawToken: string,
  meta?: { userAgent?: string | null; ip?: string | null }
): Promise<string | null> {
  const db = getDb()
  if (!db) return null

  const tokenHash = hashRefreshToken(rawToken)
  const rows = await db<{ user_id: string }[]>`
    UPDATE user_refresh_tokens
    SET revoked_at = now()
    WHERE token_hash = ${tokenHash}
      AND revoked_at IS NULL
      AND expires_at > now()
    RETURNING user_id
  `
  const userId = rows[0]?.user_id ?? null
  if (!userId) return null

  return userId
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const db = getDb()
  if (!db) return

  const tokenHash = hashRefreshToken(rawToken)
  await db`
    UPDATE user_refresh_tokens
    SET revoked_at = now()
    WHERE token_hash = ${tokenHash} AND revoked_at IS NULL
  `
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  const db = getDb()
  if (!db) return

  await db`
    UPDATE user_refresh_tokens
    SET revoked_at = now()
    WHERE user_id = ${userId} AND revoked_at IS NULL
  `
}
