export const THEME_STORAGE_KEY = "theme"

export type Theme = "light" | "dark"

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark"
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function resolveTheme(stored: string | null): Theme {
  if (isTheme(stored)) return stored
  return getSystemTheme()
}

export function readStoredTheme(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

export function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.setAttribute("data-theme", theme)
  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme
}

export function getThemeFromDocument(): Theme {
  if (typeof document === "undefined") return "light"
  const attr = document.documentElement.getAttribute("data-theme")
  return isTheme(attr) ? attr : "light"
}

/** Inline script for <head> — runs before paint to avoid flash */
export const themeInitScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);var t=s==='light'||s==='dark'?s:'dark';var r=document.documentElement;r.setAttribute('data-theme',t);if(t==='dark')r.classList.add('dark');else r.classList.remove('dark');r.style.colorScheme=t;}catch(e){document.documentElement.setAttribute('data-theme','dark');document.documentElement.classList.add('dark');}})();`
