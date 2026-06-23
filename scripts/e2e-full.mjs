#!/usr/bin/env node
/**
 * Full E2E flow — Playwright smoke + optional API smoke against local DB.
 *
 * Usage:
 *   npm run test:e2e:full
 *
 * With local database (recommended for full flow):
 *   1. Copy .env.example → .env.local and set DATABASE_URL, AUTH_SECRET
 *   2. npm run db:setup
 *   3. npm run build && npm run start   (or npm run dev in another terminal)
 *   4. DATABASE_URL=... npm run test:e2e:full
 *
 * Environment:
 *   PLAYWRIGHT_BASE_URL — default http://127.0.0.1:3000
 *   SKIP_SMOKE_API=1      — skip scripts/smoke-test.mjs
 */
import { spawnSync } from "node:child_process"

const skipApi = process.env.SKIP_SMOKE_API === "1"

console.log("\n=== Time to Match: full E2E ===\n")

const pw = spawnSync("npx", ["playwright", "test"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
})

if (pw.status !== 0) {
  process.exit(pw.status ?? 1)
}

if (!skipApi) {
  console.log("\n--- API smoke (register → discover) ---\n")
  const smoke = spawnSync("node", ["scripts/smoke-test.mjs"], {
    stdio: "inherit",
    env: process.env,
  })
  if (smoke.status !== 0) {
    console.warn("\nAPI smoke failed or server not in production mode — see scripts/smoke-test.mjs\n")
    process.exit(smoke.status ?? 1)
  }
}

console.log("\n✓ Full E2E completed\n")
