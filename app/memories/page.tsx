"use client"

import "@/app/app-globals.css"
import { Navbar } from "@/client/components/navbar"
import { RealityMemoryCinema } from "@/client/components/reality/reality-memory-cinema"
import { EmotionalTimeTimeline } from "@/client/components/time/emotional-time-timeline"
import { useEmotionalTimeline } from "@/client/hooks/use-emotional-timeline"
import { EmotionalWorldRoot } from "@/client/components/world/emotional-world-root"
import { MemoryFragmentField } from "@/client/components/reality-expansion/memory-fragment-field"
import { MemoryEchoLayer } from "@/client/components/emotional-consciousness/memory-echo-layer"
import { useEmotionalRealityExpansion } from "@/client/hooks/use-emotional-reality-expansion"
import { useI18n } from "@/client/lib/i18n"

export default function MemoriesPage() {
  const { t, locale } = useI18n()
  const timeline = useEmotionalTimeline()
  const reality = useEmotionalRealityExpansion({ locale })

  return (
    <EmotionalWorldRoot
      ambient
      className="relative min-h-screen bg-transparent ttm-brand-universe overflow-hidden"
    >
      <MemoryEchoLayer
        echoes={reality.consciousness.echoes}
        className="ec-memory-echo-layer--archive"
      />
      <Navbar />

      <div className="max-w-lg mx-auto px-6 pt-28 pb-24">

        {/* ── Epigraph ── */}
        <div className="mb-8 pl-3 border-l border-[rgba(247,37,133,0.25)]">
          <p className="text-xs italic text-white/30 leading-relaxed">
            {t("memoryArchiveEpigraph")}
          </p>
        </div>

        {/* ── Page title ── */}
        <h1 className="ttm-brand-gradient-text text-3xl font-semibold tracking-tight mb-2">
          {t("memoryArchivePageTitle")}
        </h1>
        <p className="text-sm text-white/40 font-light mb-8 leading-relaxed">
          {t("memoryArchivePageSub")}
        </p>

        <MemoryFragmentField memory={reality.memory} className="mb-8" />
        <EmotionalTimeTimeline entries={timeline} locale={locale} className="mb-10" />
        <RealityMemoryCinema limit={24} showAllLink={false} />
      </div>
    </EmotionalWorldRoot>
  )
}
