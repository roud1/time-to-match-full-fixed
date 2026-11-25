#!/usr/bin/env node
/**
 * Generates client/components/app-mode/luvia-light-generated.css: light-theme versions of the
 * Luvia screen styles that use literal dark-theme colours (white text, near-black surfaces).
 *
 *   node scripts/gen-light-theme.mjs
 *
 * Every rule with such a colour gets a copy scoped to html[data-lv][data-lv-theme="light"] with
 * the colours mapped (white text → ink, dark surfaces → light surfaces, white hairlines → ink
 * hairlines). Text that sits on a brand gradient or a photo keeps its colour. Hand-written fixes
 * belong in luvia-light.css (loaded after this file).
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")

const FILES = [
  "client/components/app-mode/app-mode.css",
  "client/components/app/app-dock.css",
  "client/components/app/app-feed.css",
  "client/components/app/app-likes.css",
  "client/components/app/app-map.css",
  "client/components/app/app-profile-detail.css",
  "client/components/app/match-celebration-luvia.css",
  "client/components/chat/app-chats.css",
  "client/components/chat/app-ai-connection.css",
  "client/components/profile/app-profile-home.css",
  "client/components/profile/profile-edit-luvia.css",
  "client/components/premium/premium-luvia.css",
  "client/components/experience/mobile-app-home.css",
  "client/components/onboarding-luvia.css",
  "client/components/discover/discover-profile-gate.css",
  "client/components/auth/app-register.css",
  "client/components/auth/app-login.css",
  "app/settings/settings-luvia.css",
  // Legacy chat / native-app styles still used by the chat screens.
  "app/dating-ui.css",
  "app/chat-layout.css",
  "app/chat-experience.css",
  "app/chat-page.css",
  "app/app-experience.css",
  "app/mobile-experience.css",
  "app/discover-experience.css",
]

const LIGHT = 'html[data-lv][data-lv-theme="light"]'

/** Selectors whose text sits on photos / scrims / brand gradients: colours stay as they are. */
const SKIP_SELECTOR = /ttm-app-swipe|likes__badge|likes__stack|photo|image|img\b|cover|hero-photo|scrim|overlay|__name-on|card__(name|meta|info|tags|chip|badge)|stack-photo|story|lightbox|video|camera|play\b/i

const BRAND_BG = /gradient|#f35ca8|#9b4dff|#f72585|#e4458f|--lv-pink|--lv-purple|--rose\b/i

const TEXT_PROPS = new Set(["color", "fill", "stroke", "caret-color", "-webkit-text-fill-color"])
const BG_PROPS = new Set(["background", "background-color"])
const LINE_PROPS = /^(border(-top|-right|-bottom|-left)?(-color)?|outline(-color)?|box-shadow|text-decoration-color)$/

const INK = "29, 21, 40"

const DARK_SURFACES = {
  "#0d0a17": "var(--lv-bg)",
  "#0c0a12": "#ffffff",
  "#120f1d": "#ffffff",
  "#171222": "#ffffff",
  "#1a1426": "#ffffff",
  "#1d1729": "#f6f1fa",
  "#241b31": "var(--lv-surface-raised)",
  "#2a2138": "#ebe3f3",
  "#0b0f14": "var(--lv-bg)",
  "#070a0f": "#f3eef8",
  "#050608": "#efe9f6",
  "#080b10": "var(--lv-bg)",
  "#0d1117": "#ffffff",
  "#131920": "#f3eef8",
  "#1a2130": "#ebe3f3",
  "#060509": "var(--lv-bg)",
  "#08040f": "var(--lv-bg)",
  "#0e0818": "#ffffff",
}

function rgbaWhite(value, map) {
  return value.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([0-9.]+)\s*\)/gi, (_, a) => map(Number(a)))
}

function mapText(value) {
  let v = value.replace(/#fff(fff)?\b/gi, "var(--lv-text)").replace(/\bwhite\b/gi, "var(--lv-text)")
  // Faint white text becomes ink with at least 55 % opacity (legible on light surfaces).
  v = rgbaWhite(v, (a) => `rgba(${INK}, ${Math.max(a, 0.55).toFixed(2)})`)
  return v
}

function mapBackground(value) {
  if (/transparent/i.test(value) && /gradient/i.test(value)) return value // photo scrims stay
  let v = value
  for (const [dark, light] of Object.entries(DARK_SURFACES)) v = v.replace(new RegExp(dark, "gi"), light)
  v = v.replace(/rgba\(\s*13\s*,\s*10\s*,\s*23\s*,\s*([0-9.]+)\s*\)/gi, (_, a) => `rgba(247, 244, 251, ${a})`)
  v = v.replace(/rgba\(\s*(?:6\s*,\s*5\s*,\s*9|12\s*,\s*10\s*,\s*18|11\s*,\s*15\s*,\s*20|13\s*,\s*17\s*,\s*23|0\s*,\s*0\s*,\s*0)\s*,\s*([0-9.]+)\s*\)/gi, (_, a) =>
    Number(a) > 0.35 ? `rgba(255, 255, 255, ${Math.max(Number(a), 0.9)})` : `rgba(${INK}, ${a})`
  )
  // Subtle white tints on dark become subtle ink tints on light.
  v = rgbaWhite(v, (a) => (a <= 0.25 ? `rgba(${INK}, ${a})` : `rgba(255, 255, 255, ${a})`))
  return v
}

function mapLine(value) {
  return rgbaWhite(value, (a) => `rgba(${INK}, ${a})`).replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([0-9.]+)\s*\)/gi, (_, a) =>
    `rgba(60, 30, 90, ${Math.min(Number(a), 0.3)})`
  )
}

function lightSelector(sel) {
  return sel
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      if (s.includes("html[data-lv]")) return s.replace("html[data-lv]", LIGHT)
      if (/^html\b/.test(s)) return s.replace(/^html/, LIGHT)
      if (/^:root\b/.test(s)) return null
      return `${LIGHT} ${s}`
    })
    .filter(Boolean)
    .join(",\n")
}

/** Minimal CSS walker: yields { selector, body, at } for every style rule (nested @media kept). */
function* rules(css, at = []) {
  let i = 0
  while (i < css.length) {
    const open = css.indexOf("{", i)
    if (open < 0) return
    const head = css.slice(i, open).replace(/\/\*[\s\S]*?\*\//g, "").trim()
    let depth = 1
    let j = open + 1
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth++
      else if (css[j] === "}") depth--
      j++
    }
    const inner = css.slice(open + 1, j - 1)
    if (head.startsWith("@media") || head.startsWith("@supports")) yield* rules(inner, [...at, head])
    else if (!head.startsWith("@")) yield { selector: head, body: inner, at }
    i = j
  }
}

function convert(rule) {
  if (SKIP_SELECTOR.test(rule.selector)) return null
  const decls = rule.body
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(";")
    .map((d) => d.trim())
    .filter((d) => d.includes(":"))
  const brandBg = decls.some((d) => /^background/.test(d) && BRAND_BG.test(d))
  const out = []
  for (const d of decls) {
    const k = d.slice(0, d.indexOf(":")).trim().toLowerCase()
    const v = d.slice(d.indexOf(":") + 1).trim()
    let nv = v
    if (TEXT_PROPS.has(k)) {
      if (brandBg) continue // white on a brand gradient stays white
      nv = mapText(v)
    } else if (BG_PROPS.has(k)) {
      if (BRAND_BG.test(v)) continue
      nv = mapBackground(v)
    } else if (LINE_PROPS.test(k)) {
      nv = mapLine(v)
    } else if (k.startsWith("--")) {
      // Colour tokens: dark surfaces → light, white text → ink, faint white tints → ink tints.
      if (/gradient/i.test(v) || BRAND_BG.test(v)) continue
      nv = mapBackground(v.replace(/#fff(fff)?\b/gi, "var(--lv-text)"))
      nv = rgbaWhite(nv, (a) => `rgba(${INK}, ${a <= 0.25 ? a : Math.max(a, 0.55).toFixed(2)})`)
    } else continue
    if (nv !== v) out.push(`  ${k}: ${nv};`)
  }
  if (!out.length) return null
  const sel = lightSelector(rule.selector)
  if (!sel) return null
  let block = `${sel} {\n${out.join("\n")}\n}`
  for (const at of [...rule.at].reverse()) block = `${at} {\n${block.replace(/^/gm, "  ")}\n}`
  return block
}

let output = `/* GENERATED by scripts/gen-light-theme.mjs — do not edit by hand.
   Light-theme copies of Luvia screen rules that use literal dark-theme colours.
   Hand-written light fixes live in luvia-light.css (loaded after this file). */\n`
let count = 0
for (const file of FILES) {
  const css = fs.readFileSync(path.join(root, file), "utf8")
  const blocks = []
  for (const r of rules(css)) {
    const b = convert(r)
    if (b) blocks.push(b)
  }
  if (blocks.length) {
    output += `\n/* ── ${file} ── */\n${blocks.join("\n\n")}\n`
    count += blocks.length
  }
}
const target = path.join(root, "client/components/app-mode/luvia-light-generated.css")
fs.writeFileSync(target, output)
console.log(`luvia-light-generated.css: ${count} rules`)
