/**
 * Email verification flow:
 *   1. sendVerificationEmail(userId, email, name) — generates token, sends email
 *   2. verifyEmailToken(token) — marks token used + sets email_verified=true
 */

import crypto from "node:crypto"
import { getDb } from "@/server/db"
import { log } from "@/server/log"
import { sendEmail } from "@/server/email/send-email"
import { emailVerifyTemplate } from "@/server/email/templates"

const TOKEN_EXPIRES_HOURS = 24

function generateToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString("hex")
  const hash = crypto.createHash("sha256").update(raw).digest("hex")
  return { raw, hash }
}

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_URL?.trim()?.replace(/^(?!https?:\/\/)/, "https://") ||
    "http://localhost:3000"
  )
}

export async function sendVerificationEmail(
  userId: string,
  email: string,
  name: string
): Promise<boolean> {
  const db = getDb()
  if (!db) return false

  const { raw, hash } = generateToken()
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRES_HOURS * 60 * 60 * 1000)

  try {
    await db`
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, purpose)
      VALUES (${userId}, ${hash}, ${expiresAt}, 'email_verify')
    `
  } catch (e) {
    log.error("email_verify_token_create_err", { userId, err: String(e) })
    return false
  }

  const verifyUrl = `${getAppUrl()}/api/v1/auth/verify-email?token=${raw}`
  const { subject, html } = emailVerifyTemplate({ name, verifyUrl })
  return sendEmail(email, subject, html)
}

export async function verifyEmailToken(
  rawToken: string
): Promise<{ ok: boolean; userId?: string; error?: string }> {
  const db = getDb()
  if (!db) return { ok: false, error: "database_unavailable" }

  const hash = crypto.createHash("sha256").update(rawToken).digest("hex")

  const rows = await db<{ id: string; user_id: string; expires_at: Date; used_at: Date | null }[]>`
    SELECT id, user_id, expires_at, used_at
    FROM password_reset_tokens
    WHERE token_hash = ${hash}
      AND purpose = 'email_verify'
    LIMIT 1
  `

  const token = rows[0]
  if (!token) return { ok: false, error: "invalid_token" }
  if (token.used_at) return { ok: false, error: "token_already_used" }
  if (new Date() > token.expires_at) return { ok: false, error: "token_expired" }

  try {
    await db`
      UPDATE password_reset_tokens SET used_at = now() WHERE id = ${token.id}
    `
    await db`
      UPDATE users SET email_verified = true WHERE id = ${token.user_id}
    `
    log.info("email_verified", { userId: token.user_id })
    return { ok: true, userId: token.user_id }
  } catch (e) {
    log.error("email_verify_err", { err: String(e) })
    return { ok: false, error: "internal_error" }
  }
}
