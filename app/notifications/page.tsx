"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Navbar } from "@/components/navbar"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { getActiveConnections, runConnectionTicks } from "@/lib/connection-store"
import { computeDailyReturnInsights } from "@/lib/shared/daily-return"
import { buildEmotionalNotifications } from "@/lib/shared/emotional-notifications"
import { EmotionalEmptyState } from "@/components/product/emotional-empty-state"
import { Bell } from "lucide-react"
import { useEffect } from "react"

type Filter = "all" | "unread" | "important"

export default function NotificationsPage() {
  const { t } = useI18n()
  const [filter, setFilter] = useState<Filter>("all")
  const [tick, setTick] = useState(0)

  useEffect(() => {
    runConnectionTicks()
    const onUpdate = () => setTick((x) => x + 1)
    window.addEventListener("ttm-connection-updated", onUpdate)
    return () => window.removeEventListener("ttm-connection-updated", onUpdate)
  }, [])

  void tick

  const items = useMemo(() => {
    const connections = getActiveConnections()
    const daily = computeDailyReturnInsights(connections)
    return buildEmotionalNotifications(connections, daily)
  }, [tick])

  const filtered = useMemo(() => {
    if (filter === "unread") return items.filter((n) => n.unread)
    if (filter === "important") return items.filter((n) => n.important)
    return items
  }, [items, filter])

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: t("notificationsAll") },
    { id: "unread", label: t("notificationsUnread") },
    { id: "important", label: t("notificationsImportant") },
  ]

  return (
    <main className="min-h-screen bg-[#050506] ttm-brand-universe">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 pt-28 pb-20">
        <h1 className="ttm-brand-gradient-text text-3xl font-extralight tracking-tight mb-2">
          {t("notificationsTitle")}
        </h1>
        <p className="ttm-type-muted text-sm mb-8">{t("notificationsLiveSubtitle")}</p>

        <div className="flex gap-2 mb-8 p-1 rounded-full ttm-brand-glass">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "flex-1 py-2 text-xs font-extralight rounded-full transition-colors",
                filter === tab.id
                  ? "bg-indigo-500/20 text-indigo-100/95"
                  : "text-white/45 hover:text-white/70"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmotionalEmptyState
            title={t("notificationsEmptyTitle")}
            body={t("notificationsEmptyBody")}
            icon={Bell}
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((n, i) => {
              const Icon = n.icon
              const href = n.profileId ? `/app?tab=chat&with=${n.profileId}` : undefined
              const inner = (
                <>
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-200/90">
                    <Icon className="w-4 h-4" strokeWidth={1.35} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extralight text-white/90">{t(n.titleKey)}</p>
                    <p className="text-xs text-white/50 font-light mt-0.5 leading-relaxed">{t(n.bodyKey)}</p>
                  </div>
                  <span className="text-[10px] text-white/35 shrink-0 font-light tabular-nums">
                    {t(n.timeKey)}
                  </span>
                </>
              )
              return (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {href ? (
                    <Link
                      href={href}
                      className={cn("p9-notif-card block", n.unread && "p9-notif-card--unread")}
                    >
                      <div className="flex gap-3 items-start">{inner}</div>
                    </Link>
                  ) : (
                    <article className={cn("p9-notif-card", n.unread && "p9-notif-card--unread")}>
                      {inner}
                    </article>
                  )}
                </motion.li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
