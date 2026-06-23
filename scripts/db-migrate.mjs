#!/usr/bin/env node
/**
 * Applies SQL files in database/migrations/ in lexical order.
 * Tracks applied files in schema_migrations (filename + applied_at).
 * Requires DATABASE_URL in the environment.
 *
 * Flags:
 *   --bootstrap   If users table exists but schema_migrations is empty, mark all
 *                 migration files as applied without re-running SQL (one-time for
 *                 databases migrated before tracking was added).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import postgres from "postgres"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const dir = path.join(root, "database", "migrations")
const bootstrap = process.argv.includes("--bootstrap")

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL is not set.")
  process.exit(1)
}

const sql = postgres(url, { max: 1 })

async function ensureTrackingTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
}

async function appliedFilenames() {
  const rows = await sql`SELECT filename FROM schema_migrations ORDER BY filename`
  return new Set(rows.map((r) => r.filename))
}

async function usersTableExists() {
  const rows = await sql`
    SELECT 1 AS ok
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
    LIMIT 1
  `
  return rows.length > 0
}

async function markApplied(filename) {
  await sql`
    INSERT INTO schema_migrations (filename)
    VALUES (${filename})
    ON CONFLICT (filename) DO NOTHING
  `
}

try {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
  if (!files.length) {
    console.error("No .sql files in", dir)
    process.exit(1)
  }

  await ensureTrackingTable()
  let applied = await appliedFilenames()

  if (bootstrap && applied.size === 0 && (await usersTableExists())) {
    console.log("→ bootstrap: marking", files.length, "migrations as already applied")
    for (const f of files) {
      await markApplied(f)
    }
    applied = await appliedFilenames()
    console.log("Bootstrap complete. Future runs will skip these files.")
    process.exit(0)
  }

  let ran = 0
  let skipped = 0

  for (const f of files) {
    if (applied.has(f)) {
      console.log("⊘ skip", f)
      skipped++
      continue
    }
    const full = path.join(dir, f)
    const body = fs.readFileSync(full, "utf8")
    console.log("→", f)
    await sql.unsafe(body)
    await markApplied(f)
    ran++
  }

  if (ran === 0 && skipped > 0) {
    console.log(`Migrations up to date (${skipped} skipped).`)
  } else {
    console.log(`Migrations applied successfully (${ran} new, ${skipped} skipped).`)
  }
} catch (e) {
  console.error(e)
  process.exit(1)
} finally {
  await sql.end({ timeout: 5 })
}
