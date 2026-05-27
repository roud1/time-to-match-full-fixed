"use client"

import { Moon, Sun } from "lucide-react"
import { useThemeMode } from "@/components/theme/theme-provider"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type ThemeToggleProps = {
  className?: string
  compact?: boolean
}

export function ThemeToggle({ className, compact }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeMode()
  const { t } = useI18n()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "ttm-theme-toggle ttm-header-icon-btn shrink-0",
        "transition-[background-color,color,border-color,box-shadow] duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        compact ? "h-9 w-9 min-h-0" : "h-10 w-10 min-h-[40px] min-w-[40px]",
        className
      )}
      aria-label={isDark ? t("themeSwitchToLight") : t("themeSwitchToDark")}
      title={isDark ? t("themeSwitchToLight") : t("themeSwitchToDark")}
    >
      <span className="relative h-4 w-4" aria-hidden>
        <Sun
          className={cn(
            "absolute inset-0 h-4 w-4 transition-all duration-300",
            isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          )}
          strokeWidth={1.5}
        />
        <Moon
          className={cn(
            "absolute inset-0 h-4 w-4 transition-all duration-300",
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          )}
          strokeWidth={1.5}
        />
      </span>
    </button>
  )
}
