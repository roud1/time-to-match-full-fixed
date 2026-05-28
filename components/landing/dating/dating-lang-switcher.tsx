"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { LanguageSwitcher } from "@/components/language-switcher"

/** Fixed bottom-right; portaled to body so scroll/layout ancestors don't break position:fixed */
export function DatingLangSwitcher() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="ttm-dating-lang-portal" aria-label="Language">
      <LanguageSwitcher />
    </div>,
    document.body
  )
}
