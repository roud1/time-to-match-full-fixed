import { getDb } from "@/lib/server/db"

export type DbUserRow = {
  id: string
  email: string
  name: string
  profile: Record<string, unknown>
  created_at: Date
  profile_expires_at: Date | null
}

export async function findUserByEmail(email: string): Promise<DbUserRow | null> {
  const db = getDb()
  if (!db) return null
  const rows = await db<DbUserRow[]>`
    SELECT id, email, name, profile, created_at, profile_expires_at
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
    SELECT id, email, name, profile, created_at, profile_expires_at
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
    SELECT id, email, name, profile, created_at, profile_expires_at, password_hash
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
