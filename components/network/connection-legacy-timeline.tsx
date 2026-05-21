"use client"

import { useMemo } from "react"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { buildConnectionLegacyTimeline } from "@/lib/network"
import { formatMemoryDate } from "@/lib/format-chat-time"
import { cn } from "@/lib/utils"

type ConnectionLegacyTimelineProps = {
  profileId?: number
  className?: string
}

export function ConnectionLegacyTimeline({ profileId, className }: ConnectionLegacyTimelineProps) {
  const { t, locale } = useI18n()
  const entries = useMemo(() => buildConnectionLegacyTimeline(t, profileId), [t, profileId])

  if (entries.length === 0) return null

  return (
    <section className={cn("p13-legacy-timeline", className)}>
      <h2 className="p13-legacy-timeline__title">{t("netLegacyTitle")}</h2>
      <p className="p13-legacy-timeline__sub">{t("netLegacySub")}</p>
      <ul className="p13-legacy-timeline__list">
        {entries.map((entry, i) => (
          <motion.li
            key={entry.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p13-legacy-timeline__item"
            data-kind={entry.kind}
          >
            <span className="p13-legacy-timeline__rail" aria-hidden />
            <div>
              <p className="p13-legacy-timeline__entry-title">{entry.title}</p>
              <p className="p13-legacy-timeline__entry-body">{entry.body}</p>
              <p className="p13-legacy-timeline__date">{formatMemoryDate(entry.at, locale)}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
