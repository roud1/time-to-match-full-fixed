import { getDb } from "@/lib/server/db"
import type { PushSubscriptionJson } from "@/lib/server/push/types"

export type DbUserRow = {
  id: string
  email: string
  name: string
  profile: Record<string, unknown>
  created_at: Date
  profile_expires_at: Date | null
  last_freeze_at: Date | null
  freeze_balance: number
  email_verified: boolean
  push_subscription: PushSubscriptionJson | null
  purpose: string | null
  latitude: number | null
  longitude: number | null
  max_distance: number
  gender: "male" | "female" | null
  age_min: number | null
  age_max: number | null
  is_active: boolean
  photo_verified: boolean
  is_blocked: boolean
  blocked_at: Date | null
  block_reason: string | null
  role: "user" | "admin"
}

export async function findUserByEmail(email: string): Promise<DbUserRow | null> {
  const db = getDb()
  if (!db) return null
  const rows = await db<DbUserRow[]>`
    SELECT id, email, name, profile, created_at, profile_expires_at, last_freeze_at, freeze_balance, email_verified, push_subscription,
      purpose, latitude, longitude, max_distance, gender, age_min, age_max, is_active, photo_verified, is_blocked, blocked_at, block_reason, role
    FROM users
    WHERE email_normalized = ${email.trim().toLowerCase()}
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function findUserById(id: string): Promise<DbUserRow | null> {
  const db = getDb()
  if (!db) return null
  const rows = await db<DbUserRow[]>`
    SELECT id, email, name, profile, created_at, profile_expires_at, last_freeze_at, freeze_balance, email_verified, push_subscription,
      purpose, latitude, longitude, max_distance, gender, age_min, age_max, is_active, photo_verified, is_blocked, blocked_at, block_reason, role
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `
  return rows[0] ?? null
}

export type DbUserWithPassword = DbUserRow & { password_hash: string }

export async function findUserForAuthByEmail(email: string): Promise<DbUserWithPassword | null> {
  const db = getDb()
  if (!db) return null
  const rows = await db<DbUserWithPassword[]>`
    SELECT id, email, name, profile, created_at, profile_expires_at, last_freeze_at, freeze_balance, email_verified, push_subscription,
      purpose, latitude, longitude, max_distance, gender, age_min, age_max, is_active, photo_verified, is_blocked, blocked_at, block_reason, role, password_hash
    FROM users
    WHERE email_normalized = ${email.trim().toLowerCase()}
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function createUser(input: {
  email: string
  passwordHash: string
  name: string
  profile: Record<string, unknown>
  profileExpiresAt: Date | null
}) {
  const db = getDb()
  if (!db) throw new Error("database_unavailable")
  const rows = await db<{ id: string }[]>`
    INSERT INTO users (email, password_hash, name, profile, profile_expires_at)
    VALUES (
      ${input.email.trim()},
      ${input.passwordHash},
      ${input.name.trim()},
      ${db.json(input.profile)},
      ${input.profileExpiresAt}
    )
    RETURNING id
  `
  return rows[0]?.id
}

export async function addFreezeBalance(userId: string, amount: number): Promise<number | null> {
  const db = getDb()
  if (!db || amount <= 0) return null
  const rows = await db<{ freeze_balance: number }[]>`
    UPDATE users
    SET freeze_balance = freeze_balance + ${amount}
    WHERE id = ${userId}
    RETURNING freeze_balance
  `
  return rows[0]?.freeze_balance ?? null
}

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionJson
): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  await db`
    UPDATE users
    SET push_subscription = ${db.json(subscription)}
    WHERE id = ${userId}
  `
  return true
}

export async function setUserEmail(userId: string, email: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  const normalized = email.trim().toLowerCase()
  await db`
    UPDATE users
    SET email = ${email.trim()}, email_verified = true
    WHERE id = ${userId}
  `
  void normalized
  return true
}
