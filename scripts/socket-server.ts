import { createServer } from "node:http"
import { readFileSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { createSocketServer } from "../server/realtime/socket/index"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return
  const content = readFileSync(filePath, "utf8")
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}

loadEnvFile(join(root, ".env"))
loadEnvFile(join(root, ".env.local"))

const port = Number(process.env.SOCKET_PORT || 3001)
const httpServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("Time to Match — Socket.io server\n")
})

createSocketServer(httpServer)

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`[socket] listening on http://0.0.0.0:${port}`)
  console.log(`[socket] set NEXT_PUBLIC_SOCKET_URL=http://localhost:${port}`)
})
