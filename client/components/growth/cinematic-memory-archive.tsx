"use client"

import { useMemo } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"
import { getConnectionMemories } from "@/client/lib/connection-store"
import { getAIMemories } from "@/client/lib/ai-connection-memory-store"
import { buildRelationshipMoments } from "@/client/lib/relationship-identity/moments"
import { buildConnectionView } from "@/client/lib/connection-system"
import { extractAIConnectionSignals } from "@/client/lib/ai-connection-engine"
import { analyzeConnection } from "@/client/lib/connection-engine"
import { getActiveConnections, getConnection } from "@/client/lib/connection-store"
import { getChatMessagesForProfile } from "@/client/lib/social-store"
import { formatMemoryDate } from "@/client/lib/format-chat-time"
import { cn } from "@/client/lib/utils"

type CinematicMemoryArchiveProps = {
  profileId?: number
  limit?: number
  className?: string
}

/** How many messages were exchanged — shown as proof of connection */
function MessageCount({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="text-[10px] text-white/28 font-light tabular-nums">
      {count} {count === 1 ? "message" : "messages"}
    </span>
  )
}

/** Duration pill — shows how many hours the connection lasted */
function DurationPill({ startedAt, endedAt }: { startedAt?: number; endedAt: number }) {
  if (!startedAt) return null
  const hours = Math.round((endedAt - startedAt) / 1000 / 60 / 60)
  if (hours < 1) return null
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/35">
      <span aria-hidden>⏳</span>
      {hours}h
    </span>
  )
}

export function CinematicMemoryArchive({ profileId, limit = 6, className }: CinematicMemoryArchiveProps) {
  const { t, locale } = useI18n()

  const items = useMemo(() => {
    const archived = getConnectionMemories()
    const cards: {
      id: string
      name: string
      sub: string
      firstMessage?: string
      messageCount: number
      startedAt?: number
      at: number
      kind: "archived" | "ai" | "moment"
    }[] = []

    // ── Archived (expired / faded) connections ──
    for (const m of archived) {
      if (profileId != null && m.profileId !== profileId) continue

      // Get first message from the conversation if available
      const messages = getChatMessagesForProfile(m.profileId)
      const firstMsg = messages.find((msg) => msg.text?.trim())?.text?.trim()
      const truncated = firstMsg
        ? firstMsg.length > 72 ? firstMsg.slice(0, 72) + "…" : firstMsg
        : undefined

      cards.push({
        id: `arch-${m.profileId}-${m.endedAt}`,
        name: m.profileName || t("trustBlockedUser"),
        sub: m.reason === "faded"
          ? t("connectionMemoryFaded")
          : t("connectionMemoryExpired"),
        firstMessage: truncated,
        messageCount: messages.length,
        startedAt: m.matchedAt,
        at: m.endedAt,
        kind: "archived",
      })
    }

    const profileIds =
      profileId != null
        ? [profileId]
        : [...new Set([
            ...getActiveConnections().map((c) => c.profileId),
            ...archived.map((m) => m.profileId),
          ])]

    // ── Moments & AI peaks ──
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
          name: mom.title,
          sub: mom.subtitle ?? "",
          messageCount: 0,
          at: mom.at,
          kind: "moment",
        })
      }
      for (const ai of getAIMemories(pid)) {
        cards.push({
          id: `ai-${pid}-${ai.id}`,
          name: ai.label,
          sub: t("memoryAiPeak"),
          messageCount: 0,
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
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
          {t("memoryArchiveTitle")}
        </h2>
        <Link
          href="/memories"
          className="text-[10px] text-[rgba(247,37,133,0.6)] hover:text-[rgba(247,37,133,0.9)] transition-colors font-medium"
        >
          {t("memoryArchiveAll")}
        </Link>
      </div>

      <ul className="space-y-2">
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="memory-card relative px-4 py-4 rounded-2xl overflow-hidden"
              style={{
                background: "rgba(13,17,23,0.72)",
                border: "0.5px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
              }}
            >
              {/* Sepia tint — visual metaphor for the past */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background: item.kind === "archived"
                    ? "linear-gradient(135deg, rgba(247,37,133,0.04) 0%, transparent 60%)"
                    : "transparent",
                  pointerEvents: "none",
                }}
              />

              {/* Name + duration */}
              <div className="relative flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-white/80 leading-tight">
                  {item.name}
                </p>
                {item.kind === "archived" && (
                  <DurationPill startedAt={item.startedAt} endedAt={item.at} />
                )}
              </div>

              {/* Emotional sub-line */}
              <p className="relative text-xs text-white/40 leading-relaxed mb-2">
                {item.sub}
              </p>

              {/* First message — ghost of the conversation */}
              {item.firstMessage && (
                <p className="relative text-xs italic text-white/28 leading-relaxed border-l border-white/[0.08] pl-2.5 mb-2">
                  &ldquo;{item.firstMessage}&rdquo;
                </p>
              )}

              {/* Footer: message count + date */}
              <div className="relative flex items-center justify-between gap-2 mt-1">
                <MessageCount count={item.messageCount} />
                <p className="text-[10px] text-white/25 font-light tabular-nums">
                  {formatMemoryDate(item.at, locale)}
                </p>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
