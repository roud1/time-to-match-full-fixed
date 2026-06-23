"use client"

import "@/app/app-globals.css"
import { Navbar } from "@/components/navbar"
import { RealityMemoryCinema } from "@/components/reality/reality-memory-cinema"
import { EmotionalTimeTimeline } from "@/components/time/emotional-time-timeline"
import { useEmotionalTimeline } from "@/hooks/use-emotional-timeline"
import { EmotionalWorldRoot } from "@/components/world/emotional-world-root"
import { MemoryFragmentField } from "@/components/reality-expansion/memory-fragment-field"
import { MemoryEchoLayer } from "@/components/emotional-consciousness/memory-echo-layer"
import { useEmotionalRealityExpansion } from "@/hooks/use-emotional-reality-expansion"
import { useI18n } from "@/lib/i18n"

export default function MemoriesPage() {
  const { t, locale } = useI18n()
  const timeline = useEmotionalTimeline()
  const reality = useEmotionalRealityExpansion({ locale })

  return (
    <EmotionalWorldRoot ambient className="relative min-h-screen bg-transparent ttm-brand-universe overflow-hidden">
      <MemoryEchoLayer echoes={reality.consciousness.echoes} className="ec-memory-echo-layer--archive" />
      <Navbar />
      <div className="max-w-lg mx-auto px-6 pt-28 pb-20">
        <h1 className="ttm-brand-gradient-text text-3xl font-extralight tracking-tight mb-2">
          {t("memoryArchivePageTitle")}
        </h1>
        <p className="text-sm text-white/50 font-light mb-6 leading-relaxed">
          {t("memoryArchivePageSub")}
        </p>
        <MemoryFragmentField memory={reality.memory} className="mb-8" />
        <EmotionalTimeTimeline entries={timeline} locale={locale} className="mb-10" />
        <RealityMemoryCinema limit={24} showAllLink={false} />
      </div>
    </EmotionalWorldRoot>
  )
}
