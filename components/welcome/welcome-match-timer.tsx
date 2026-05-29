"use client"

import { useEffect, useState } from "react"
import { Timer } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const MATCH_MS = 24 * 60 * 60 * 1000

function formatHms(totalMs: number) {
  const totalSec = Math.max(0, Math.floor(totalMs / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/** Demo 24h match countdown (educational — resets when it hits zero). */
export function WelcomeMatchTimer() {
  const { t } = useI18n()
  const [remaining, setRemaining] = useState(MATCH_MS)

  useEffect(() => {
    const started = Date.now()
    const id = window.setInterval(() => {
      const elapsed = Date.now() - started
      const next = MATCH_MS - (elapsed % (MATCH_MS + 1000))
      setRemaining(next > 0 ? next : MATCH_MS)
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="ttm-welcome-match-timer" role="group" aria-label={t("welcomeMatchTimerAria")}>
      <div className="ttm-welcome-match-timer__head">
        <Timer className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
        <div>
          <p className="ttm-welcome-match-timer__title">{t("welcomeMatchTimerTitle")}</p>
          <p className="ttm-welcome-match-timer__body">{t("welcomeMatchTimerBody")}</p>
        </div>
      </div>
      <p className="ttm-welcome-match-timer__value tabular-nums" aria-live="polite">
        {formatHms(remaining)}
      </p>
      <p className="ttm-welcome-match-timer__demo">{t("welcomeMatchTimerDemo")}</p>
    </div>
  )
}
