"use client"

import type { StoredUserProfile } from "@/lib/user-profile"
import { getProfileAura } from "@/lib/product-experience"
import { cn } from "@/lib/utils"

type ProfileAuraProps = {
  profile: Pick<StoredUserProfile, "vibeIds" | "mood" | "energyTagIds">
  className?: string
}

export function ProfileAura({ profile, className }: ProfileAuraProps) {
  const aura = getProfileAura(profile)

  return (
    <div
      className={cn("p9-profile-aura", className)}
      style={{
        background: aura.gradient,
        opacity: 0.5 + aura.saturation,
      }}
      aria-hidden
    />
  )
}
