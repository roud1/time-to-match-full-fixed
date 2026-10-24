"use client"

import "./app-mode.css"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"

/** Back arrow for the native app / installed PWA (hidden in the browser, see app-mode.css). */
export function AppBackButton() {
  const router = useRouter()
  const { t } = useI18n()
  return (
    <button
      type="button"
      className="ttm-app-back"
      aria-label={t("regBack")}
      onClick={() => {
        if (window.history.length > 1) router.back()
        else router.push("/")
      }}
    >
      <ChevronLeft aria-hidden className="h-6 w-6" />
    </button>
  )
}
