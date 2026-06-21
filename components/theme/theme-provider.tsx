"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  applyTheme,
  getSystemTheme,
  persistTheme,
  readStoredTheme,
  resolveTheme,
  type Theme,
} from "@/lib/theme"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  /** Must match SSR so hydration agrees with server HTML (see inline ThemeScript on <html>). */
  const [theme, setThemeState] = useState<Theme>("dark")

  const setTheme = useCallback((next: Theme) => {
    persistTheme(next)
    applyTheme(next)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  useLayoutEffect(() => {
    const stored = readStoredTheme()
    const resolved = resolveTheme(stored)
    applyTheme(resolved)
    setThemeState(resolved)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onSystemChange = () => {
      if (readStoredTheme()) return
      const next = getSystemTheme()
      applyTheme(next)
      setThemeState(next)
    }
    mq.addEventListener("change", onSystemChange)
    return () => mq.removeEventListener("change", onSystemChange)
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useThemeMode must be used within ThemeProvider")
  }
  return ctx
}
