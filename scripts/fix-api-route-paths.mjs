#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name === "route.ts") out.push(p)
  }
  return out
}

for (const f of walk(path.join(root, "app", "api"))) {
  let t = fs.readFileSync(f, "utf8")
  const n = t.replace(/@\/api\/handlers\/([^"\n]+)/g, (_, segment) => {
    const fixed = segment.replace(/\\/g, "/")
    return `@/api/handlers/${fixed}`
  })
  if (n !== t) {
    fs.writeFileSync(f, n)
    console.log("fixed", path.relative(root, f))
  }
}
