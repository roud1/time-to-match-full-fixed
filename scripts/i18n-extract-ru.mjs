/**
 * Extracts Russian messages from lib/i18n.tsx → lib/i18n/locales/ru.json
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const i18nPath = path.join(__dirname, "..", "lib/i18n.tsx")
const outPath = path.join(__dirname, "..", "lib/i18n/locales/ru.json")

function findBlockEnd(src, openBraceIndex) {
  let depth = 0
  let i = openBraceIndex
  let inString = false
  let quote = ""
  let escaped = false
  for (; i < src.length; i++) {
    const ch = src[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === "\\") escaped = true
      else if (ch === quote) inString = false
      continue
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true
      quote = ch
      continue
    }
    if (ch === "{") depth++
    else if (ch === "}") {
      depth--
      if (depth === 0) return i
    }
  }
  throw new Error("ru block end not found")
}

const src = fs.readFileSync(i18nPath, "utf8")
const marker = "\n  ru: {"
const start = src.indexOf(marker)
if (start < 0) throw new Error("ru block not found")
const openBrace = start + marker.length - 1
const closeBrace = findBlockEnd(src, openBrace)
const body = src.slice(openBrace, closeBrace + 1)
const ru = new Function(`return ${body}`)()

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(ru, null, 2), "utf8")
console.log("Wrote", outPath, "keys:", Object.keys(ru).length)
