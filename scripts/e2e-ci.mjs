#!/usr/bin/env node
/**
 * Mirror GitHub Actions E2E locally: docker Postgres → migrate → build → server → Playwright + smoke.
 *
 * Usage:
 *   npm run test:e2e:ci
 *
 * Prerequisites: Docker (docker compose), Node 22+
 *
 * Environment (optional overrides):
 *   SKIP_DOCKER=1     — assume Postgres already running on 127.0.0.1:5432
 *   SKIP_SMOKE_API=1  — skip scripts/smoke-test.mjs after Playwright
 */
import { spawn, spawnSync } from "node:child_process"
import net from "node:net"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const LOCAL_DATABASE_URL = "postgresql://ttm:ttm_dev_password@127.0.0.1:5432/timetomatch"
const LOCAL_AUTH_SECRET = "dev-local-auth-secret-min-32-chars!!"
const LOCAL_CRON_SECRET = "local-cron-secret-for-tests-only!"
const BASE_URL = "http://127.0.0.1:3000"

const baseEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || LOCAL_DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET || LOCAL_AUTH_SECRET,
  CRON_SECRET: process.env.CRON_SECRET || LOCAL_CRON_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || BASE_URL,
  PLAYWRIGHT_SKIP_WEBSERVER: "1",
  PLAYWRIGHT_BASE_URL: BASE_URL,
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env: baseEnv,
    shell: process.platform === "win32",
    ...opts,
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
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

let serverProc = null

function stopServer() {
  if (!serverProc) return
  try {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/pid", String(serverProc.pid), "/f", "/t"], { stdio: "ignore" })
    } else {
      serverProc.kill("SIGTERM")
    }
  } catch {
    /* ignore */
  }
  serverProc = null
}

process.on("SIGINT", () => {
  stopServer()
  process.exit(130)
})
process.on("SIGTERM", () => {
  stopServer()
  process.exit(143)
})

async function main() {
  console.log("\n=== Time to Match: E2E (CI mirror) ===\n")

  if (process.env.SKIP_DOCKER !== "1") {
    console.log("→ docker compose up -d postgres")
    run("docker", ["compose", "up", "-d", "postgres"])
    await waitForPostgres()
  } else {
    console.log("→ SKIP_DOCKER=1 — using existing Postgres")
    if (!(await portOpen("127.0.0.1", 5432))) {
      throw new Error("Postgres not reachable on 127.0.0.1:5432")
    }
  }

  run("npm", ["run", "db:migrate"])
  run("npm", ["run", "build"])

  console.log("→ starting production server in background")
  serverProc = spawn("npm", ["run", "start"], {
    cwd: root,
    env: baseEnv,
    stdio: "ignore",
    shell: process.platform === "win32",
    detached: process.platform !== "win32",
  })

  try {
    run("node", ["scripts/wait-ready.mjs"])
    run("npx", ["playwright", "install", "chromium"])
    run("npm", ["run", "test:e2e"])

    if (process.env.SKIP_SMOKE_API !== "1") {
      console.log("\n--- API smoke (register → discover) ---\n")
      run("npm", ["run", "smoke-test"])
    }
  } finally {
    stopServer()
  }

  console.log("\n✓ E2E CI mirror completed\n")
}

main().catch((err) => {
  stopServer()
  console.error(err)
  process.exit(1)
})
