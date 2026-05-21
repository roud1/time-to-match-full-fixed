"use client"

import { useState } from "react"
import Image from "next/image"
import type { SyncMetrics } from "@/lib/sync-system"
import type { RelationshipPersonality } from "@/lib/relationship-identity/types"
import { SyncRing } from "@/components/sync/sync-ring"
import { PresenceAvatarAura } from "@/components/presence/presence-avatar-aura"
import type { EmotionalPresence } from "@/lib/world"
import type { ConnectionResonance } from "@/lib/presence"
import { cn } from "@/lib/utils"

type ChatProfileAvatarProps = {
  src: string
  name: string
  profileId?: number
  size?: "sm" | "md"
  showOnline?: boolean
  emotionalPresence?: EmotionalPresence | null
  resonance?: ConnectionResonance | null
  sharedPresence?: boolean
  syncMetrics?: SyncMetrics | null
  aiBoost?: boolean
  syncSurge?: boolean
  relationshipPersonality?: RelationshipPersonality
  evolutionProgress?: number
  className?: string
}

const SIZE_PX = { sm: 48, md: 56 } as const
const SIZE_CLASS = { sm: "w-12 h-12", md: "w-14 h-14" } as const
const RING_SIZE = { sm: "sm" as const, md: "md" as const }

function avatarInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?"
}

export function ChatProfileAvatar({
  src,
  name,
  size = "md",
  showOnline = true,
  emotionalPresence = null,
  resonance = null,
  sharedPresence = false,
  syncMetrics = null,
  aiBoost = false,
  syncSurge = false,
  relationshipPersonality,
  evolutionProgress,
  className,
}: ChatProfileAvatarProps) {
  const px = SIZE_PX[size]
  const [failed, setFailed] = useState(false)

  const avatar = (
    <div className="relative h-full w-full overflow-hidden rounded-full bg-[#0c0c0c]">
      {failed || !src ? (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/5 text-lg font-extralight text-white/90"
          aria-hidden
        >
          {avatarInitial(name)}
        </div>
      ) : (
        <Image
          src={src}
          alt={name}
          width={px}
          height={px}
          unoptimized
          className="h-full w-full object-cover"
          sizes={`${px}px`}
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )

  return (
    <div className={cn("relative shrink-0", SIZE_CLASS[size], className)}>
      {syncMetrics ? (
        <SyncRing
          metrics={syncMetrics}
          size={RING_SIZE[size]}
          aiBoost={aiBoost}
          syncSurge={syncSurge}
          relationshipPersonality={relationshipPersonality}
          evolutionProgress={evolutionProgress}
        >
          {avatar}
        </SyncRing>
      ) : (
        <div className="h-full w-full rounded-full ring-1 ring-white/15">{avatar}</div>
      )}
      {emotionalPresence ? (
        <PresenceAvatarAura
          presence={emotionalPresence}
          resonance={resonance ?? undefined}
          shared={sharedPresence}
          className="absolute inset-0 rounded-full"
        />
      ) : (
        showOnline && (
          <span
            className="absolute -bottom-0.5 -right-0.5 z-10 h-3.5 w-3.5 rounded-full border-2 border-[#050506] bg-indigo-300/80 shadow-[0_0_8px_rgba(165,180,252,0.45)]"
            aria-hidden
          />
        )
      )}
    </div>
  )
}
