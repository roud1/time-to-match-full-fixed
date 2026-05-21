"use client"

import { motion } from "motion/react"
import { Heart, MessageCircle, Bell, Zap } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { useState } from "react"

const DEMO = [
  { icon: Heart, title: "Новый матч", body: "Аня — взаимная симпатия, связь растёт", time: "2 мин" },
  { icon: MessageCircle, title: "Сообщение", body: "«Привет! Как настроение?»", time: "12 мин" },
  { icon: Zap, title: "Sync +6", body: "Активность в чате усилила синхронизацию", time: "1 ч" },
  { icon: Bell, title: "Таймер", body: "До исчезновения анкеты осталось 18 часов", time: "3 ч" },
]

type Filter = "all" | "unread" | "important"

export default function NotificationsPage() {
  const { t } = useI18n()
  const [filter, setFilter] = useState<Filter>("all")

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: t("notificationsAll") },
    { id: "unread", label: t("notificationsUnread") },
    { id: "important", label: t("notificationsImportant") },
  ]

  return (
    <main className="min-h-screen bg-[#050506]">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 pt-28 pb-20">
        <h1 className="ttm-h1 mb-8">{t("notificationsTitle")}</h1>
        <div className="flex gap-2 mb-8 p-1 rounded-full ttm-glass">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "flex-1 py-2 text-xs font-medium rounded-full transition-colors",
                filter === tab.id
                  ? "bg-[var(--ttm-warm)]/20 text-[var(--ttm-warm)]"
                  : "text-[var(--ttm-text-muted)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <ul className="space-y-3">
          {DEMO.map((n, i) => (
            <motion.li
              key={n.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <article className="ttm-notif-card">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--ttm-warm)]/10 flex items-center justify-center text-[var(--ttm-warm)]">
                  <n.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--ttm-text)]">{n.title}</p>
                  <p className="text-xs text-[var(--ttm-text-secondary)] mt-0.5 truncate">{n.body}</p>
                </div>
                <span className="text-[10px] text-[var(--ttm-text-muted)] shrink-0">{n.time}</span>
              </article>
            </motion.li>
          ))}
        </ul>
      </div>
    </main>
  )
}
