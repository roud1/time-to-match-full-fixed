#!/usr/bin/env node
/**
 * Local Postgres bootstrap: docker compose up → wait for health → migrate.
 * Copies .env.example → .env.local when .env.local is missing (no secrets committed).
 */
import { execSync, spawnSync } from "node:child_process"
import fs from "node:fs"
import net from "node:net"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const composeFile = path.join(root, "docker-compose.yml")
const envExample = path.join(root, ".env.example")
const envLocal = path.join(root, ".env.local")

const LOCAL_DATABASE_URL = "postgresql://ttm:ttm_dev_password@127.0.0.1:5432/timetomatch"

function run(cmd, opts = {}) {
  console.log("→", cmd)
  execSync(cmd, { cwd: root, stdio: "inherit", ...opts })
}

function portOpen(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port }, () => {
      socket.end()
      resolve(true)
    })
    socket.on("error", () => resolve(false))
  })
}

async function waitForPostgres(maxMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    if (await portOpen("127.0.0.1", 5432)) return
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw new Error("Postgres did not become ready on 127.0.0.1:5432")
}

function ensureEnvLocal() {
  if (fs.existsSync(envLocal)) {
    console.log("→ .env.local already exists — not overwriting")
    return
  }
  if (!fs.existsSync(envExample)) {
    console.warn("→ .env.example missing — create .env.local manually")
    return
  }
  let content = fs.readFileSync(envExample, "utf8")
  if (!content.includes("DATABASE_URL=postgresql://")) {
    content = content.replace(
      /^DATABASE_URL=.*$/m,
      `DATABASE_URL=${LOCAL_DATABASE_URL}`
    )
    if (!/^DATABASE_URL=/m.test(content)) {
      content += `\nDATABASE_URL=${LOCAL_DATABASE_URL}\n`
    }
  }
  if (!/^AUTH_SECRET=.+$/m.test(content)) {
    content = content.replace(/^AUTH_SECRET=.*$/m, "AUTH_SECRET=dev-local-auth-secret-min-32-chars!!")
  }
  fs.writeFileSync(envLocal, content, "utf8")
  console.log("→ Created .env.local from .env.example (dev secrets only — do not commit)")
}

function loadEnvLocal() {
  if (!fs.existsSync(envLocal)) return
  for (const line of fs.readFileSync(envLocal, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

async function main() {
  if (!fs.existsSync(composeFile)) {
    console.error("docker-compose.yml not found in project root.")
    process.exit(1)
  }

  const compose = spawnSync("docker", ["compose", "version"], { encoding: "utf8" })
  if (compose.status !== 0) {
    console.error("Docker Compose is required. Install Docker Desktop and retry.")
    process.exit(1)
  }

  ensureEnvLocal()
  loadEnvLocal()

  run("docker compose up -d")
  console.log("→ Waiting for Postgres…")
  await waitForPostgres()

  process.env.DATABASE_URL = process.env.DATABASE_URL || LOCAL_DATABASE_URL
  run("npm run db:migrate", { env: process.env })

  console.log("\nLocal DB ready. Next: npm run dev")
  console.log("Verify: curl http://localhost:3000/api/ready")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
