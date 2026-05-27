/**
 * Translate ru.json → target locale (Lingva + MyMemory fallback, parallel batches, cached).
 * Usage: node scripts/i18n-translate-from-ru.mjs en uk de es pl fr it tr
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, "..", "lib/i18n/locales")
const ruPath = path.join(localesDir, "ru.json")
const cacheDir = path.join(localesDir, ".cache")

const BATCH_SIZE = 5
const BATCH_PAUSE_MS = 350
const LINGVA_HOSTS = ["https://lingva.ml", "https://lingva.lunar.icu"]
let lingvaHostIndex = 0
const TARGET_MAP = { en: "en", uk: "uk", de: "de", es: "es", pl: "pl", fr: "fr", it: "it", tr: "tr" }
const SKIP =
  /^(Time to Match|SYNC|FAQ|Cookies|Email|AI|OK|ID|VIP|Premium|Pro|Google|Apple|Facebook|Instagram|Twitter|YouTube|TikTok|WhatsApp|Telegram)$/i
const CYRILLIC = /[а-яіїєґ]/i
const MYMEMORY_FAIL = /MYMEMORY WARNING/i

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function protectPlaceholders(s) {
  const tokens = []
  const safe = s.replace(/\{[a-zA-Z0-9_]+\}/g, (m) => {
    const id = `__PH${tokens.length}__`
    tokens.push({ id, value: m })
    return id
  })
  return { safe, tokens }
}

function restorePlaceholders(s, tokens) {
  let out = s
  for (const { id, value } of tokens) out = out.replaceAll(id, value)
  return out
}

function isValidTranslation(source, translated) {
  if (!translated?.trim()) return false
  if (MYMEMORY_FAIL.test(translated)) return false
  if (CYRILLIC.test(source) && translated.trim() === source.trim()) return false
  return true
}

async function translateViaLingva(text, target) {
  for (let a = 0; a < LINGVA_HOSTS.length * 2; a++) {
    const host = LINGVA_HOSTS[lingvaHostIndex % LINGVA_HOSTS.length]
    lingvaHostIndex++
    const url = `${host}/api/v1/ru/${target}/${encodeURIComponent(text)}`
    try {
      const res = await fetch(url)
      const raw = await res.text()
      if (!res.ok) {
        await sleep(200 + a * 100)
        continue
      }
      let data
      try {
        data = JSON.parse(raw)
      } catch {
        await sleep(900)
        continue
      }
      if (data.translation && isValidTranslation(text, data.translation)) {
        return data.translation
      }
    } catch {
      await sleep(200)
    }
  }
  return null
}

async function translateViaMyMemory(text, langpair) {
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(text) +
    "&langpair=" +
    langpair

  for (let a = 0; a < 3; a++) {
    try {
      const res = await fetch(url)
      const data = await res.json()
      const out = data.responseData?.translatedText
      if (data.responseStatus === 200 && out && isValidTranslation(text, out)) {
        return out
      }
      if (data.responseStatus === 429) await sleep(2500 * (a + 1))
    } catch {
      await sleep(1000)
    }
  }
  return null
}

async function translateOne(text, target) {
  if (!text?.trim() || SKIP.test(text.trim())) return text
  if (/^[\d\s:.,+\-{}%$€₴₽]+$/i.test(text.trim()) && !CYRILLIC.test(text)) return text

  const { safe, tokens } = protectPlaceholders(text)
  const langTarget = TARGET_MAP[target] ?? target
  const lingva = await translateViaLingva(safe, langTarget)
  if (lingva) return restorePlaceholders(lingva, tokens)

  const mymemory = await translateViaMyMemory(safe, `ru|${langTarget}`)
  if (mymemory) return restorePlaceholders(mymemory, tokens)

  return text
}

function collectStrings(value, set = new Set()) {
  if (typeof value === "string") {
    set.add(value)
    return set
  }
  if (Array.isArray(value)) {
    for (const v of value) collectStrings(v, set)
    return set
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectStrings(v, set)
  }
  return set
}

function remap(value, map) {
  if (typeof value === "string") return map.get(value) ?? value
  if (Array.isArray(value)) return value.map((v) => remap(v, map))
  if (value && typeof value === "object") {
    const o = {}
    for (const [k, v] of Object.entries(value)) o[k] = remap(v, map)
    return o
  }
  return value
}

function sanitizeCache(cache) {
  const cleaned = {}
  for (const [source, translated] of Object.entries(cache)) {
    if (isValidTranslation(source, translated)) cleaned[source] = translated
  }
  return cleaned
}

function loadCache(cachePath) {
  if (!fs.existsSync(cachePath)) return {}
  return sanitizeCache(JSON.parse(fs.readFileSync(cachePath, "utf8")))
}

async function translateLocale(target) {
  const ru = JSON.parse(fs.readFileSync(ruPath, "utf8"))
  fs.mkdirSync(cacheDir, { recursive: true })
  const cachePath = path.join(cacheDir, `ru-to-${target}.json`)
  const cache = loadCache(cachePath)

  const unique = [...collectStrings(ru)]
  const pending = unique.filter((s) => cache[s] === undefined)
  console.log(`[ru→${target}] ${unique.length} strings, ${pending.length} to translate`)

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE)
    process.stdout.write(
      `\r[ru→${target}] ${Math.min(i + BATCH_SIZE, pending.length)}/${pending.length}   `
    )
    const results = await Promise.all(batch.map((s) => translateOne(s, target)))
    batch.forEach((s, j) => {
      if (isValidTranslation(s, results[j])) cache[s] = results[j]
    })
    fs.writeFileSync(cachePath, JSON.stringify(sanitizeCache(cache), null, 2))
    const map = new Map(Object.entries(cache))
    fs.writeFileSync(
      path.join(localesDir, `${target}.json`),
      JSON.stringify(remap(ru, map), null, 2)
    )
    await sleep(BATCH_PAUSE_MS)
  }
  fs.writeFileSync(cachePath, JSON.stringify(sanitizeCache(cache), null, 2))

  const map = new Map(Object.entries(cache))
  fs.writeFileSync(path.join(localesDir, `${target}.json`), JSON.stringify(remap(ru, map), null, 2))
  const untranslated = unique.filter((s) => CYRILLIC.test(s) && map.get(s) === s).length
  console.log(`\nWrote lib/i18n/locales/${target}.json (${untranslated} still Cyrillic)`)
}

const targets = process.argv.slice(2)
if (!targets.length) {
  console.error("Usage: node scripts/i18n-translate-from-ru.mjs en uk de es pl fr it tr")
  process.exit(1)
}
for (const t of targets) await translateLocale(t)
