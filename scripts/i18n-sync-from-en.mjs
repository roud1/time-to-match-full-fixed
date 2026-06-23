/**
 * Copy missing keys from en.json into other locale JSON files (English fallback).
 *
 * WARNING: This only ADDS missing top-level keys — it does NOT re-translate existing
 * values. Running it after real translations will fill gaps with English, but will
 * not repair locales that were overwritten. For full locale files use:
 *   npm run i18n:extract-ru   — refresh ru.json from lib/i18n.tsx
 *   npm run i18n:translate    — translate ru → uk de es pl fr it tr (cached API)
 *
 * Usage: node scripts/i18n-sync-from-en.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, "..", "lib/i18n/locales")
const enPath = path.join(localesDir, "en.json")
const targets = ["ru", "uk", "de", "es", "pl", "fr", "it", "tr"]

const en = JSON.parse(fs.readFileSync(enPath, "utf8"))

for (const loc of targets) {
  const file = path.join(localesDir, `${loc}.json`)
  const current = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {}
  let added = 0
  for (const [key, value] of Object.entries(en)) {
    if (!(key in current)) {
      current[key] = value
      added++
    }
  }
  const sorted = Object.fromEntries(Object.keys(current).sort().map((k) => [k, current[k]]))
  fs.writeFileSync(file, JSON.stringify(sorted, null, 2) + "\n", "utf8")
  console.log(`${loc}: +${added} keys (total ${Object.keys(sorted).length})`)
}
