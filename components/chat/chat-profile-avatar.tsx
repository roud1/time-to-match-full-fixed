"use client"

import { useState } from "react"
import Image from "next/image"
import type { SyncMetrics } from "@/lib/sync-system"
import { isPulseProfile } from "@/lib/pulse-companion"
import { PulseAvatar } from "@/components/chat/pulse-avatar"
import { SyncRing } from "@/components/sync/sync-ring"
import { cn } from "@/lib/utils"

type ChatProfileAvatarProps = {
  src: string
  name: string
  profileId?: number
  size?: "sm" | "md"
  showOnline?: boolean
  syncMetrics?: SyncMetrics | null
  aiBoost?: boolean
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
  profileId,
  size = "md",
  showOnline = true,
  syncMetrics = null,
  aiBoost = false,
  className,
}: ChatProfileAvatarProps) {
  const px = SIZE_PX[size]
  const [failed, setFailed] = useState(false)
  const isPulse = profileId != null && isPulseProfile(profileId)

  if (isPulse) {
    return (
      <div className={cn("relative shrink-0", SIZE_CLASS[size], className)}>
        <PulseAvatar size={size} />
        {showOnline && (
          <span
            className="absolute -bottom-0.5 -right-0.5 z-10 h-3.5 w-3.5 rounded-full border-2 border-[#050506] bg-violet-400/90 shadow-[0_0_8px_rgba(167,139,250,0.55)]"
            aria-hidden
          />
        )}
      </div>
    )
  }

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
        <SyncRing metrics={syncMetrics} size={RING_SIZE[size]} aiBoost={aiBoost}>
          {avatar}
        </SyncRing>
      ) : (
        <div className="h-full w-full rounded-full ring-1 ring-white/15">{avatar}</div>
      )}
      {showOnline && (
        <span
          className="absolute -bottom-0.5 -right-0.5 z-10 h-3.5 w-3.5 rounded-full border-2 border-[#050506] bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
          aria-hidden
        />
      )}
    </div>
  )
}
