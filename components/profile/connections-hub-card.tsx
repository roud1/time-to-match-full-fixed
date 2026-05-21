"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { formatConnectionTime } from "@/lib/connection-system"
import { getConnectionSummary } from "@/lib/connection-summary"
import { cn } from "@/lib/utils"

export function ConnectionsHubCard() {
  const { t } = useI18n()
  const [summary, setSummary] = useState(getConnectionSummary)

  useEffect(() => {
    const sync = () => setSummary(getConnectionSummary())
    sync()
    const id = setInterval(sync, 1000)
    window.addEventListener("ttm-connection-updated", sync)
    window.addEventListener("ttm-social-updated", sync)
    return () => {
      clearInterval(id)
      window.removeEventListener("ttm-connection-updated", sync)
      window.removeEventListener("ttm-social-updated", sync)
    }
  }, [])

  return (
    <div className="rounded-[1.35rem] p-5 mb-5 border border-white/10 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.06] backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-light mb-1">
            {t("profileConnectionsEyebrow")}
          </p>
          <h2 className="text-lg font-extralight text-foreground/95 mb-1">{t("profileConnectionsTitle")}</h2>
          <p className="text-sm font-light text-muted-foreground/85 leading-relaxed">
            {summary.activeCount === 0
              ? t("profileConnectionsEmpty")
              : t("profileConnectionsActive").replace("{count}", String(summary.activeCount))}
          </p>
          {summary.nearestRemainingMs != null && summary.activeCount > 0 && (
            <p className="mt-2 text-xs font-light tabular-nums text-white/80/90">
              {t("profileConnectionsNearest")}{" "}
              <span className={cn(summary.urgentCount > 0 && "text-amber-300")}>
                {formatConnectionTime(summary.nearestRemainingMs)}
              </span>
            </p>
          )}
          {summary.maxStreakDays > 0 && (
            <p className="mt-2 text-[10px] uppercase tracking-wider text-white/40 font-extralight">
              {t("syncStreakDays").replace("{days}", String(summary.maxStreakDays))}
            </p>
          )}
        </div>
      </div>
      <Link
        href="/app?tab=chat"
        className="mt-4 block w-full rounded-2xl border border-white/12 bg-white/[0.04] py-3 text-center text-sm font-extralight text-white/85 hover:border-white/25 hover:bg-white/[0.06] transition-colors touch-manipulation"
      >
        {t("profileConnectionsCta")}
      </Link>
    </div>
  )
}
