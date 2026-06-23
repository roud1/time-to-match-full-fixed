/**
 * Validates and formats lib/i18n/locales/ru.json (canonical Russian catalog).
 * Reports key drift vs en.json.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ruPath = path.join(__dirname, "..", "lib/i18n/locales/ru.json")
const enPath = path.join(__dirname, "..", "lib/i18n/locales/en.json")

const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"))
const en = JSON.parse(fs.readFileSync(enPath, "utf8"))

const ruKeys = new Set(Object.keys(ru))
const enKeys = new Set(Object.keys(en))
const missingInRu = [...enKeys].filter((k) => !ruKeys.has(k))
const extraInRu = [...ruKeys].filter((k) => !enKeys.has(k))

fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2), "utf8")
console.log("Wrote", ruPath, "keys:", ruKeys.size)

if (missingInRu.length) {
  console.warn("Missing in ru.json:", missingInRu.length, missingInRu.slice(0, 10).join(", "))
}
if (extraInRu.length) {
  console.warn("Extra in ru.json:", extraInRu.length, extraInRu.slice(0, 10).join(", "))
}
