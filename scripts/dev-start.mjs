#!/usr/bin/env node
/**
 * Frees port 3000 (stale Next dev often hangs there) then starts `next dev`.
 */
import { spawn, execSync } from "node:child_process"
import fs from "node:fs"
import net from "node:net"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.join(fileURLToPath(new URL(".", import.meta.url)), "..")
const PORT = Number(process.env.PORT || 3000)

function portInUse(port) {
  return new Promise((resolve) => {
    const srv = net.createServer()
    srv.once("error", () => resolve(true))
    srv.once("listening", () => {
      srv.close(() => resolve(false))
    })
    srv.listen(port, "127.0.0.1")
  })
}

function killPortWindows(port) {
  try {
    const lockPath = path.join(root, ".next", "dev", "lock")
    try {
      const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"))
      if (lock?.pid) {
        try {
          execSync(`taskkill /F /PID ${lock.pid}`, { stdio: "ignore" })
          console.log(`[dev-start] Stopped stale Next dev PID ${lock.pid} (lock file)`)
        } catch {
          /* already dead */
        }
      }
    } catch {
      /* no lock */
    }

    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" })
    const pids = new Set()
    for (const line of out.split("\n")) {
      if (!line.includes("LISTENING")) continue
      const parts = line.trim().split(/\s+/)
      const pid = parts[parts.length - 1]
      if (pid && /^\d+$/.test(pid)) pids.add(pid)
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" })
        console.log(`[dev-start] Stopped PID ${pid} on port ${port}`)
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* no listeners */
  }
}

async function main() {
  if (process.platform === "win32" && (await portInUse(PORT))) {
    console.log(`[dev-start] Port ${PORT} busy — stopping stale process…`)
    killPortWindows(PORT)
    await new Promise((r) => setTimeout(r, 800))
  }

  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next")

  const child = spawn(process.execPath, [nextBin, "dev", "-H", "0.0.0.0", "-p", String(PORT)], {
    stdio: "inherit",
    cwd: root,
    env: process.env,
  })

  child.on("exit", (code) => process.exit(code ?? 0))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
