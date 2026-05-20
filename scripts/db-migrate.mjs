#!/usr/bin/env node
/**
 * Applies SQL files in db/migrations/ in lexical order.
 * Requires DATABASE_URL in the environment.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import postgres from "postgres"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const dir = path.join(root, "db", "migrations")

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL is not set.")
  process.exit(1)
}

const sql = postgres(url, { max: 1 })

try {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
  if (!files.length) {
    console.error("No .sql files in", dir)
    process.exit(1)
  }
  for (const f of files) {
    const full = path.join(dir, f)
    const body = fs.readFileSync(full, "utf8")
    console.log("→", f)
    await sql.unsafe(body)
  }
  console.log("Migrations applied successfully.")
} catch (e) {
  console.error(e)
  process.exit(1)
} finally {
  await sql.end({ timeout: 5 })
}
