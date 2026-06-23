#!/usr/bin/env node
/**
 * One-time migration: client / server / api / database / config layout.
 * Run from repo root: node scripts/restructure-project.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function moveDir(src, dest) {
  if (!fs.existsSync(src)) return false
  ensureDir(path.dirname(dest))
  fs.renameSync(src, dest)
  return true
}

function moveFile(src, dest) {
  if (!fs.existsSync(src)) return false
  ensureDir(path.dirname(dest))
  fs.renameSync(src, dest)
  return true
}

function walk(dir, filter = () => true) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next" || ent.name === ".git") continue
      out.push(...walk(full, filter))
    } else if (filter(full)) {
      out.push(full)
    }
  }
  return out
}

function replaceInFile(file, replacements) {
  let text = fs.readFileSync(file, "utf8")
  let changed = false
  for (const [from, to] of replacements) {
    if (text.includes(from)) {
      text = text.split(from).join(to)
      changed = true
    }
  }
  if (changed) fs.writeFileSync(file, text)
  return changed
}

// --- Phase 1: physical moves ---
console.log("Phase 1: moving directories…")
ensureDir(path.join(root, "client"))
ensureDir(path.join(root, "api", "handlers"))
ensureDir(path.join(root, "database"))
ensureDir(path.join(root, "config"))
ensureDir(path.join(root, "shared"))

moveDir(path.join(root, "lib", "server"), path.join(root, "server"))
moveDir(path.join(root, "components"), path.join(root, "client", "components"))
moveDir(path.join(root, "hooks"), path.join(root, "client", "hooks"))
moveDir(path.join(root, "styles"), path.join(root, "client", "styles"))
moveDir(path.join(root, "db", "migrations"), path.join(root, "database", "migrations"))

if (fs.existsSync(path.join(root, "lib"))) {
  for (const name of fs.readdirSync(path.join(root, "lib"))) {
    moveDir(path.join(root, "lib", name), path.join(root, "client", "lib", name))
  }
  try {
    fs.rmdirSync(path.join(root, "lib"))
  } catch {
    /* non-empty */
  }
}

if (fs.existsSync(path.join(root, "types"))) {
  moveDir(path.join(root, "types"), path.join(root, "shared", "types"))
}

// --- Phase 2: config module ---
console.log("Phase 2: creating config/…")
const envSrc = path.join(root, "server", "env.ts")
if (fs.existsSync(envSrc)) {
  moveFile(envSrc, path.join(root, "config", "env.ts"))
}

const configApp = `/** Application identity and public URLs. */
export const APP_NAME = "Time to Match" as const
export const APP_SLUG = "time-to-match" as const

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? \`https://\${process.env.VERCEL_URL}\` : "http://localhost:3000")
  )
}
`

const configDatabase = `/** PostgreSQL pool defaults (used by server/db). */
export function defaultDatabasePoolMax(): number {
  const configured = process.env.DATABASE_POOL_MAX?.trim()
  if (configured) return Number(configured)
  if (process.env.VERCEL === "1") return 5
  return 10
}
`

const configStripe = `import { getServerEnv } from "@/config/env"

export type BillingPlan = "premium" | "vip"

export const BILLING_PLANS: Record<
  BillingPlan,
  { label: string; unitAmountCents: number; currency: string }
> = {
  premium: { label: "Time to Match Premium", unitAmountCents: 900, currency: "usd" },
  vip: { label: "Time to Match VIP", unitAmountCents: 1900, currency: "usd" },
}

export function isStripeConfigured(): boolean {
  const secret = process.env.STRIPE_SECRET_KEY?.trim()
  const pub = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
  return Boolean(secret && pub && secret.length > 8)
}

export function getStripeSecretKey(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  return key && key.length > 8 ? key : null
}

export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null
}

export function billingMode(): "demo" | "live" {
  if (!getServerEnv().isDatabaseConfigured) return "demo"
  return isStripeConfigured() ? "live" : "demo"
}
`

const configConstants = `/** Shared product constants (match timing, etc.). */
export const MATCH_EXPIRY_HOURS = 24
export const MATCH_FREEZE_EXTENSION_HOURS = 24
export const MATCH_FREEZE_COOLDOWN_HOURS = 24
`

const configIndex = `export * from "./env"
export * from "./app"
export * from "./database"
export * from "./stripe"
export * from "./constants"
`

fs.writeFileSync(path.join(root, "config", "app.ts"), configApp)
fs.writeFileSync(path.join(root, "config", "database.ts"), configDatabase)
fs.writeFileSync(path.join(root, "config", "stripe.ts"), configStripe)
fs.writeFileSync(path.join(root, "config", "constants.ts"), configConstants)
fs.writeFileSync(path.join(root, "config", "index.ts"), configIndex)

// Slim server billing config — re-export from config
const billingConfigPath = path.join(root, "server", "billing", "config.ts")
if (fs.existsSync(billingConfigPath)) {
  fs.writeFileSync(
    billingConfigPath,
    `export {
  BILLING_PLANS,
  billingMode,
  getStripeSecretKey,
  getStripeWebhookSecret,
  isStripeConfigured,
  type BillingPlan,
} from "@/config/stripe"
export { getAppBaseUrl } from "@/config/app"
`
  )
}

// --- Phase 3: extract API handlers ---
console.log("Phase 3: extracting API handlers…")
const routeFiles = walk(path.join(root, "app", "api"), (f) => f.endsWith(`${path.sep}route.ts`))

for (const routeFile of routeFiles) {
  const rel = path.relative(path.join(root, "app", "api"), routeFile)
  const handlerDir = path.join(root, "api", "handlers", path.dirname(rel))
  const handlerFile = path.join(handlerDir, "handler.ts")
  ensureDir(handlerDir)

  const content = fs.readFileSync(routeFile, "utf8")
  fs.writeFileSync(handlerFile, content)

  const handlerImport = `@/api/handlers/${path.dirname(rel).replace(/\\\\/g, "/")}/handler`
  const exportNames = []
  for (const m of content.matchAll(/^export (?:async )?function (\w+)/gm)) exportNames.push(m[1])
  for (const m of content.matchAll(/^export const (\w+)/gm)) {
    const name = m[1]
    if (["dynamic", "runtime", "revalidate", "fetchCache", "preferredRegion"].includes(name)) {
      exportNames.push(name)
    }
  }

  const unique = [...new Set(exportNames)]
  const wrapper =
    unique.length > 0
      ? `/** Thin Next.js entry — logic in @/api/handlers */\nexport { ${unique.join(", ")} } from "${handlerImport}"\n`
      : `/** Thin Next.js entry — logic in @/api/handlers */\nexport * from "${handlerImport}"\n`

  fs.writeFileSync(routeFile, wrapper)
}

// --- Phase 4: bulk import updates ---
console.log("Phase 4: updating imports…")
const codeFiles = walk(root, (f) => /\.(ts|tsx|mjs)$/.test(f) && !f.includes("restructure-project.mjs"))

const replacements = [
  ['@/lib/server/', '@/server/'],
  ['@/server/env', '@/config/env'],
  ['@/components/', '@/client/components/'],
  ['@/hooks/', '@/client/hooks/'],
  ['@/styles/', '@/client/styles/'],
  ['@/lib/', '@/client/lib/'],
  ['db/migrations', 'database/migrations'],
]

for (const file of codeFiles) {
  replaceInFile(file, replacements)
}

// Update server/db.ts to use config/database
const dbPath = path.join(root, "server", "db.ts")
if (fs.existsSync(dbPath)) {
  let db = fs.readFileSync(dbPath, "utf8")
  db = db.replace(
    /function defaultPoolMax\(\)[\s\S]*?^}/m,
    'import { defaultDatabasePoolMax } from "@/config/database"\n'
  )
  db = db.replace(/defaultPoolMax\(\)/g, "defaultDatabasePoolMax()")
  fs.writeFileSync(dbPath, db)
}

// --- Phase 5: tsconfig paths ---
console.log("Phase 5: updating tsconfig.json…")
const tsconfigPath = path.join(root, "tsconfig.json")
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"))
tsconfig.compilerOptions.paths = {
  "@/*": ["./*"],
  "@/client/*": ["./client/*"],
  "@/server/*": ["./server/*"],
  "@/api/*": ["./api/*"],
  "@/database/*": ["./database/*"],
  "@/config/*": ["./config/*"],
  "@/shared/*": ["./shared/*"],
}
fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + "\n")

// components.json
const componentsJsonPath = path.join(root, "components.json")
if (fs.existsSync(componentsJsonPath)) {
  const cj = JSON.parse(fs.readFileSync(componentsJsonPath, "utf8"))
  cj.aliases = {
    components: "@/client/components",
    utils: "@/client/lib/utils",
    ui: "@/client/components/ui",
    lib: "@/client/lib",
    hooks: "@/client/hooks",
  }
  fs.writeFileSync(componentsJsonPath, JSON.stringify(cj, null, 2) + "\n")
}

console.log("Done. Run: npm run typecheck && npm run build")
