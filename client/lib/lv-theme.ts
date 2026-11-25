/**
 * Luvia app appearance: dark (default), light, or follow the system. Stored per device.
 * Applied as html[data-lv-theme="light" | "dark"] before first paint (see lvThemeInitScript), so the
 * legacy website light theme (driven by data-theme) is never triggered by it.
 */

export const LV_THEME_KEY = "lv-theme"
export type LvThemePref = "dark" | "light" | "system"
export type LvTheme = "dark" | "light"

const BG: Record<LvTheme, string> = { dark: "#0d0a17", light: "#f7f4fb" }

export function readLvThemePref(): LvThemePref {
  try {
    const v = localStorage.getItem(LV_THEME_KEY)
    return v === "light" || v === "system" ? v : "dark"
  } catch {
    return "dark"
  }
}

export function resolveLvTheme(pref: LvThemePref): LvTheme {
  if (pref !== "system") return pref
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

export function applyLvTheme(theme: LvTheme): void {
  const root = document.documentElement
  root.setAttribute("data-lv-theme", theme)
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BG[theme])
  // iPhone home-screen app: dark status-bar text on the light theme (white text would be invisible).
  document
    .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    ?.setAttribute("content", theme === "light" ? "default" : "black-translucent")
}

export function setLvThemePref(pref: LvThemePref): void {
  try {
    localStorage.setItem(LV_THEME_KEY, pref)
  } catch {
    /* storage blocked: applies for this visit only */
  }
  applyLvTheme(resolveLvTheme(pref))
}

/** Inline <head> script: applies the stored appearance before the first paint (no flash). */
export const lvThemeInitScript = `(function(){try{var p=localStorage.getItem('${LV_THEME_KEY}');var l=p==='light'||(p==='system'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches);var d=document.documentElement;d.setAttribute('data-lv-theme',l?'light':'dark');if(l){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','${BG.light}');var a=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');if(a)a.setAttribute('content','default')}}catch(e){}})();`
