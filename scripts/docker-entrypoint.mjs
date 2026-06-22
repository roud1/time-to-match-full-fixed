#!/usr/bin/env node
/**
 * Docker entrypoint: optionally run migrations, then start Next standalone server.
 * Set RUN_MIGRATIONS=1 and DATABASE_URL to migrate on container start.
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")

function runNode(script, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    })
    child.on("error", reject)
    child.on("exit", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${script} exited with ${code}`))
    })
  })
}

async function main() {
  if (process.env.RUN_MIGRATIONS === "1") {
    if (!process.env.DATABASE_URL) {
      console.warn("[entrypoint] RUN_MIGRATIONS=1 but DATABASE_URL unset — skipping migrate")
    } else {
      console.log("[entrypoint] Running database migrations…")
      await runNode(path.join(root, "scripts", "db-migrate.mjs"))
    }
  }

  const server = path.join(root, "server.js")
  const child = spawn(process.execPath, [server], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  })
  child.on("exit", (code) => process.exit(code ?? 0))
}

main().catch((e) => {
  console.error("[entrypoint]", e)
  process.exit(1)
})
