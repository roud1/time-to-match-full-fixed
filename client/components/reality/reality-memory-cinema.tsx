"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEcosystemMemories } from "@/client/hooks/use-ecosystem-memories"
import { enrichMemoriesForReality } from "@/client/lib/reality"
import { MemoryPlaybackOverlay, type MemoryPlaybackItem } from "@/client/components/world/memory-playback-overlay"
import { useI18n } from "@/client/lib/i18n"
import { formatMemoryDate } from "@/client/lib/format-chat-time"
import { STAGE_LABEL_KEYS } from "@/client/lib/ecosystem"
import { cn } from "@/client/lib/utils"

type RealityMemoryCinemaProps = {
  profileId?: number
  limit?: number
  className?: string
  showAllLink?: boolean
}

export function RealityMemoryCinema({
  profileId,
  limit = 24,
  className,
  showAllLink = true,
}: RealityMemoryCinemaProps) {
  const { t, locale } = useI18n()
  const reduce = useReducedMotion()
  const raw = useEcosystemMemories(profileId, limit)
  const items = enrichMemoriesForReality(raw)
  const [playback, setPlayback] = useState<MemoryPlaybackItem | null>(null)

  if (items.length === 0) {
    return (
      <p className={cn("text-sm text-white/40 font-light text-center py-12", className)}>
        {t("memoryArchiveEmpty")}
      </p>
    )
  }

  return (
    <>
      <section className={cn("p16-memory-cinema", className)}>
        {showAllLink && (
          <div className="flex items-center justify-between px-1 mb-4">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-extralight">
              {t("realMemCinemaTitle")}
            </h2>
            <Link href="/memories" className="text-[10px] text-indigo-200/70 hover:text-indigo-100/90 font-light">
              {t("memoryArchiveAll")}
            </Link>
          </div>
        )}
        <ul className="p16-memory-cinema__list">
          {items.map((item, i) => (
            <li key={item.id}>
              <motion.button
                type="button"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.36), duration: 0.5 }}
                className="p16-memory-cinema__card w-full text-left touch-manipulation"
                style={{ ["--real-mem-weight" as string]: String(item.cinematicWeight) }}
                data-eco-stage={item.stage}
                onClick={() =>
                  setPlayback({
                    title: item.title,
                    body: item.body,
                    dateLabel: formatMemoryDate(item.at, locale),
                  })
                }
              >
                <span className="p16-memory-cinema__glow" aria-hidden />
                {item.stage && (
                  <p className="p16-memory-cinema__stage">{t(STAGE_LABEL_KEYS[item.stage])}</p>
                )}
                <p className="p16-memory-cinema__title">{item.title}</p>
                <p className="p16-memory-cinema__summary">{t(item.summaryKey)}</p>
                <p className="p16-memory-cinema__body">{item.body}</p>
                <p className="p16-memory-cinema__date">{formatMemoryDate(item.at, locale)}</p>
              </motion.button>
            </li>
          ))}
        </ul>
      </section>
      <MemoryPlaybackOverlay item={playback} onClose={() => setPlayback(null)} />
    </>
  )
}
