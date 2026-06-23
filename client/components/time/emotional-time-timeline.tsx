"use client"

import { motion, useReducedMotion } from "motion/react"
import type { EmotionalTimelineEntry } from "@/client/lib/time"
import type { Locale } from "@/client/lib/i18n"
import { useI18n } from "@/client/lib/i18n"
import { formatMemoryDate } from "@/client/lib/format-chat-time"
import { cn } from "@/client/lib/utils"

type EmotionalTimeTimelineProps = {
  entries: EmotionalTimelineEntry[]
  locale: Locale
  className?: string
  compact?: boolean
}

export function EmotionalTimeTimeline({
  entries,
  locale,
  className,
  compact,
}: EmotionalTimeTimelineProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  if (entries.length === 0) return null

  const visible = compact ? entries.slice(-5) : entries

  return (
    <section className={cn("p17-emotional-timeline", compact && "p17-emotional-timeline--compact", className)}>
      {!compact && (
        <>
          <h2 className="p17-emotional-timeline__title">{t("timeTimelineTitle")}</h2>
          <p className="p17-emotional-timeline__sub">{t("timeTimelineSub")}</p>
        </>
      )}
      <ol className="p17-emotional-timeline__list">
        {visible.map((entry, i) => (
          <motion.li
            key={entry.id}
            initial={reduce ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.5 }}
            className="p17-emotional-timeline__item"
            data-kind={entry.kind}
            style={{ ["--time-pulse" as string]: String(entry.pulse) }}
          >
            <span className="p17-emotional-timeline__breath" aria-hidden />
            <span className="p17-emotional-timeline__dot" aria-hidden />
            <div>
              <p className="p17-emotional-timeline__entry-title">{t(entry.titleKey)}</p>
              <p className="p17-emotional-timeline__entry-body">{t(entry.bodyKey)}</p>
              <p className="p17-emotional-timeline__date">{formatMemoryDate(entry.at, locale)}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
