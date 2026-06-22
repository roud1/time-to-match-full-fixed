"use client"

import { useMemo } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { getConnectionMemories } from "@/lib/connection-store"
import { getAIMemories } from "@/lib/ai-connection-memory-store"
import { buildRelationshipMoments } from "@/lib/relationship-identity/moments"
import { buildConnectionView } from "@/lib/connection-system"
import { extractAIConnectionSignals } from "@/lib/ai-connection-engine"
import { analyzeConnection } from "@/lib/connection-engine"
import { getActiveConnections, getConnection } from "@/lib/connection-store"
import { getChatMessagesForProfile } from "@/lib/social-store"
import { formatMemoryDate } from "@/lib/format-chat-time"
import { cn } from "@/lib/utils"

type CinematicMemoryArchiveProps = {
  profileId?: number
  limit?: number
  className?: string
}

export function CinematicMemoryArchive({ profileId, limit = 6, className }: CinematicMemoryArchiveProps) {
  const { t, locale } = useI18n()

  const items = useMemo(() => {
    const archived = getConnectionMemories()
    const cards: {
      id: string
      title: string
      sub: string
      at: number
      kind: "archived" | "ai" | "moment"
    }[] = []

    for (const m of archived) {
      if (profileId != null && m.profileId !== profileId) continue
      cards.push({
        id: `arch-${m.profileId}-${m.endedAt}`,
        title: m.profileName || t("trustBlockedUser"),
        sub: m.reason === "faded" ? t("connectionMemoryFaded") : t("connectionMemoryExpired"),
        at: m.endedAt,
        kind: "archived",
      })
    }

    const profileIds =
      profileId != null
        ? [profileId]
        : [...new Set([...getActiveConnections().map((c) => c.profileId), ...archived.map((m) => m.profileId)])]

    for (const pid of profileIds) {
      const record = getConnection(pid)
      const messages = getChatMessagesForProfile(pid)
      if (!record) continue
      const view = buildConnectionView(record)
      const signals = extractAIConnectionSignals(messages, record)
      const analysis = analyzeConnection(view, messages, record)
      const moments = buildRelationshipMoments(messages, record, signals, analysis.syncPercent, t)
      for (const mom of moments.filter((x) => x.reached).slice(-2)) {
        cards.push({
          id: `mom-${pid}-${mom.id}`,
          title: mom.title,
          sub: mom.subtitle ?? "",
          at: mom.at,
          kind: "moment",
        })
      }
      for (const ai of getAIMemories(pid)) {
        cards.push({
          id: `ai-${pid}-${ai.id}`,
          title: ai.label,
          sub: t("memoryAiPeak"),
          at: ai.at,
          kind: "ai",
        })
      }
    }

    return cards.sort((a, b) => b.at - a.at).slice(0, limit)
  }, [profileId, limit, t])

  if (items.length === 0) return null

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-extralight">
          {t("memoryArchiveTitle")}
        </h2>
        <Link href="/memories" className="text-[10px] text-indigo-200/70 hover:text-indigo-100/90 font-light">
          {t("memoryArchiveAll")}
        </Link>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className="p10-memory-cinematic relative px-4 py-3.5">
              <p className="relative text-sm font-extralight text-white/88">{item.title}</p>
              <p className="relative text-xs font-light text-white/45 mt-1 leading-relaxed">{item.sub}</p>
              <p className="relative text-[10px] text-white/30 font-light mt-2 tabular-nums">
                {formatMemoryDate(item.at, locale)}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
