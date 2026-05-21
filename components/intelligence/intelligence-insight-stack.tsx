"use client"

import type { ConnectionIntelligence } from "@/lib/intelligence"
import { PersonalityMirrorCard } from "@/components/intelligence/personality-mirror-card"
import { CompatibilityInsightPanel } from "@/components/intelligence/compatibility-insight-panel"
import { DeepConnectionStateRibbon } from "@/components/intelligence/deep-connection-state-ribbon"
import { ConnectionForecastStrip } from "@/components/intelligence/connection-forecast-strip"
import { RelationshipRhythmBadge } from "@/components/intelligence/relationship-rhythm-badge"
import { cn } from "@/lib/utils"

type IntelligenceInsightStackProps = {
  intelligence: ConnectionIntelligence
  className?: string
}

export function IntelligenceInsightStack({ intelligence, className }: IntelligenceInsightStackProps) {
  return (
    <div className={cn("p14-intel-stack", className)} {...intelligence.uiAttrs}>
      <DeepConnectionStateRibbon profile={intelligence.deepState} />
      <div className="p14-intel-stack__row">
        <RelationshipRhythmBadge rhythm={intelligence.rhythm} />
        <CompatibilityInsightPanel compatibility={intelligence.compatibility} compact />
      </div>
      <ConnectionForecastStrip forecast={intelligence.forecast} />
      <PersonalityMirrorCard lines={intelligence.mirror} />
    </div>
  )
}
