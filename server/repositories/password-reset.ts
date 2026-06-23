import { createHash, randomBytes } from "crypto"
import { getDb } from "@/server/db"

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export function generateResetToken(): string {
  return randomBytes(32).toString("base64url")
}

export async function createPasswordResetToken(userId: string, ttlMs = 60 * 60 * 1000): Promise<string> {
  const db = getDb()
  if (!db) throw new Error("database_unavailable")

  const token = generateResetToken()
  const tokenHash = hashResetToken(token)
  const expiresAt = new Date(Date.now() + ttlMs)

  await db`
    UPDATE password_reset_tokens
    SET used_at = now()
    WHERE user_id = ${userId} AND used_at IS NULL
  `

  await db`
    INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
    VALUES (${userId}, ${tokenHash}, ${expiresAt})
  `

  return token
}

export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const db = getDb()
  if (!db) return null

  const tokenHash = hashResetToken(token)
  const rows = await db<{ user_id: string }[]>`
    UPDATE password_reset_tokens
    SET used_at = now()
    WHERE token_hash = ${tokenHash}
      AND used_at IS NULL
      AND expires_at > now()
    RETURNING user_id
  `
  return rows[0]?.user_id ?? null
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  await db`
    UPDATE users SET password_hash = ${passwordHash}
    WHERE id = ${userId}
  `
  return true
}
