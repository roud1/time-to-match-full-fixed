"use client"

import type { Locale } from "@/lib/i18n"
import type { StoredUserProfile } from "@/lib/user-profile"
import {
  getVibeLabel,
  getIntentionLabel,
  getMoodLabel,
  getEnergyTagLabel,
  getCommunicationStyleLabel,
  getConnectionPrefLabel,
} from "@/lib/profile-identity"
import { cn } from "@/lib/utils"

type ProfileIdentitySummaryProps = {
  profile: Pick<
    StoredUserProfile,
    "vibeIds" | "intention" | "mood" | "energyTagIds" | "communicationStyle" | "connectionPref" | "promptFavorite"
  >
  locale: Locale
  compact?: boolean
  className?: string
}

export function ProfileIdentitySummary({ profile, locale, compact, className }: ProfileIdentitySummaryProps) {
  const vibes = profile.vibeIds ?? []
  const energies = profile.energyTagIds ?? []

  return (
    <div className={cn("space-y-3", className)}>
      {vibes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {vibes.map((id) => (
            <span
              key={id}
              className={cn(
                "rounded-full border border-white/14 bg-white/[0.06] font-light text-white/85",
                compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
              )}
            >
              {getVibeLabel(id, locale)}
            </span>
          ))}
        </div>
      )}
      {energies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {energies.map((id) => (
            <span
              key={id}
              className={cn(
                "rounded-full border border-indigo-400/25 bg-indigo-500/10 font-light text-indigo-100/90",
                compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
              )}
            >
              {getEnergyTagLabel(id, locale)}
            </span>
          ))}
        </div>
      )}
      <div className={cn("grid gap-2", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
        {profile.intention && (
          <IdentityChip label={getIntentionLabel(profile.intention, locale)} compact={compact} />
        )}
        {profile.mood && <IdentityChip label={getMoodLabel(profile.mood, locale)} compact={compact} />}
        {profile.communicationStyle && (
          <IdentityChip label={getCommunicationStyleLabel(profile.communicationStyle, locale)} compact={compact} />
        )}
        {profile.connectionPref && (
          <IdentityChip label={getConnectionPrefLabel(profile.connectionPref, locale)} compact={compact} />
        )}
      </div>
      {profile.promptFavorite && !compact && (
        <p className="text-sm font-light text-white/55 leading-relaxed border-l border-white/12 pl-3">
          {profile.promptFavorite}
        </p>
      )}
    </div>
  )
}

function IdentityChip({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-xl border border-white/10 bg-black/25 font-light text-white/80",
        compact ? "px-2.5 py-2 text-[11px]" : "px-3 py-2.5 text-xs"
      )}
    >
      {label}
    </span>
  )
}
