#!/usr/bin/env node
/**
 * Next.js requires route segment config (dynamic, runtime, etc.) in route.ts —
 * not re-exported from handlers. Regenerate thin wrappers.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")

const SEGMENT_CONFIG = new Set([
  "dynamic",
  "runtime",
  "revalidate",
  "fetchCache",
  "preferredRegion",
  "maxDuration",
])

const HTTP_HANDLERS = new Set([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
])

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name === "route.ts") out.push(p)
  }
  return out
}

function handlerImportPath(routeFile) {
  const rel = path.relative(path.join(root, "app", "api"), routeFile)
  const dir = path.dirname(rel).replace(/\\/g, "/")
  return `@/api/handlers/${dir}/handler`
}

for (const routeFile of walk(path.join(root, "app", "api"))) {
  const handlerFile = routeFile
    .replace(`${path.sep}app${path.sep}api${path.sep}`, `${path.sep}api${path.sep}handlers${path.sep}`)
    .replace(`${path.sep}route.ts`, `${path.sep}handler.ts`)

  if (!fs.existsSync(handlerFile)) continue

  const content = fs.readFileSync(handlerFile, "utf8")
  const segmentLines = []
  const handlers = []

  for (const m of content.matchAll(/^export const (\w+)\s*=/gm)) {
    if (SEGMENT_CONFIG.has(m[1])) segmentLines.push(`export { ${m[1]} } from "${handlerImportPath(routeFile)}"`)
  }

  // Next.js needs segment config defined in route.ts — copy literal exports
  const literalSegment = []
  for (const name of SEGMENT_CONFIG) {
    const re = new RegExp(`^export const ${name}\\s*=\\s*([^;\\n]+)`, "m")
    const m = content.match(re)
    if (m) literalSegment.push(`export const ${name} = ${m[1]}`)
  }

  for (const m of content.matchAll(/^export (?:async )?function (\w+)/gm)) {
    if (HTTP_HANDLERS.has(m[1])) handlers.push(m[1])
  }

  const importPath = handlerImportPath(routeFile)
  const lines = ["/** Thin Next.js entry — logic in @/api/handlers */", ""]

  if (literalSegment.length) {
    lines.push(...literalSegment, "")
  }

  if (handlers.length) {
    lines.push(`export { ${handlers.join(", ")} } from "${importPath}"`)
  }

  fs.writeFileSync(routeFile, lines.join("\n") + "\n")
  console.log("updated", path.relative(root, routeFile))
}
