"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme/theme-toggle"

/** Fixed bottom-right theme + language on the dating homepage. */
export function DatingLangSwitcher() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="ttm-dating-floating-chrome" aria-label="Settings">
      <ThemeToggle compact className="ttm-dating-floating-chrome__theme" />
      <LanguageSwitcher />
    </div>,
    document.body
  )
}
