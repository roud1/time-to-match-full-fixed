"use client"

import { useState } from "react"
import Link from "next/link"
import { useEcosystemMemories } from "@/hooks/use-ecosystem-memories"
import { EcosystemMemoryCard } from "@/components/ecosystem/ecosystem-memory-card"
import { MemoryPlaybackOverlay, type MemoryPlaybackItem } from "@/components/world/memory-playback-overlay"
import { useI18n } from "@/lib/i18n"
import { formatMemoryDate } from "@/lib/format-chat-time"
import { cn } from "@/lib/utils"

type EcosystemMemoryArchiveProps = {
  profileId?: number
  limit?: number
  className?: string
  showAllLink?: boolean
}

export function EcosystemMemoryArchive({
  profileId,
  limit = 12,
  className,
  showAllLink = true,
}: EcosystemMemoryArchiveProps) {
  const { t, locale } = useI18n()
  const items = useEcosystemMemories(profileId, limit)
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
      <section className={cn("space-y-3", className)}>
        {showAllLink && (
          <div className="flex items-center justify-between px-1 mb-4">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-extralight">
              {t("memoryArchiveTitle")}
            </h2>
            <Link href="/memories" className="text-[10px] text-indigo-200/70 hover:text-indigo-100/90 font-light">
              {t("memoryArchiveAll")}
            </Link>
          </div>
        )}
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full text-left touch-manipulation active:scale-[0.99] transition-transform"
                onClick={() =>
                  setPlayback({
                    title: item.title,
                    body: item.body,
                    dateLabel: formatMemoryDate(item.at, locale),
                    stage: item.stage,
                  })
                }
              >
                <EcosystemMemoryCard
                  title={item.title}
                  body={item.body}
                  dateLabel={formatMemoryDate(item.at, locale)}
                  stage={item.stage}
                  featured={item.featured}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>
      <MemoryPlaybackOverlay item={playback} onClose={() => setPlayback(null)} />
    </>
  )
}
