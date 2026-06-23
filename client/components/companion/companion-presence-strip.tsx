"use client"

import type { EmotionalCompanion } from "@/client/lib/companion"
import { DeepConnectionStateRibbon } from "@/client/components/intelligence/deep-connection-state-ribbon"
import { RelationshipRhythmBadge } from "@/client/components/intelligence/relationship-rhythm-badge"
import { CompanionPresenceWhisper } from "@/client/components/companion/companion-presence-whisper"
import { CompanionReflectionWhisper } from "@/client/components/companion/companion-reflection-whisper"
import { CompanionStoryWhisper } from "@/client/components/companion/companion-story-whisper"
import { cn } from "@/client/lib/utils"

type CompanionPresenceStripProps = {
  profileId: number
  companion: EmotionalCompanion
  className?: string
}

/** Silent companion UI — observations, rare reflections, story — no chatbot. */
export function CompanionPresenceStrip({
  profileId,
  companion,
  className,
}: CompanionPresenceStripProps) {
  const { intelligence, observation, reflection, story } = companion

  return (
    <div className={cn("p15-companion-strip", className)}>
      <div className="p15-companion-strip__signals">
        <DeepConnectionStateRibbon profile={intelligence.deepState} />
        <RelationshipRhythmBadge rhythm={intelligence.rhythm} />
      </div>
      <CompanionPresenceWhisper observation={observation} />
      {reflection && (
        <CompanionReflectionWhisper profileId={profileId} reflection={reflection} />
      )}
      {story && <CompanionStoryWhisper story={story} />}
    </div>
  )
}
