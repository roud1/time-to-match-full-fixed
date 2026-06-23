"use client"

import { cn } from "@/client/lib/utils"
import { useI18n } from "@/client/lib/i18n"

export type ProfileSection = "profile" | "premium"

type ProfileTabsProps = {
  active: ProfileSection
  onChange: (section: ProfileSection) => void
  premiumActive?: boolean
}

export function ProfileTabs({ active, onChange, premiumActive }: ProfileTabsProps) {
  const { t } = useI18n()

  const tabs: { id: ProfileSection; label: string }[] = [
    { id: "profile", label: t("profileTabProfile") },
    { id: "premium", label: t("profileTabPremium") },
  ]

  return (
    <div className="glass mb-4 flex rounded-2xl border border-foreground/10 p-1">
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-1 rounded-xl py-2.5 text-sm font-light tracking-wide transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
            )}
          >
            {isActive && (
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/20 border border-white/12" />
            )}
            <span className="relative flex items-center justify-center gap-1.5">
              {tab.id === "premium" && (
                <svg
                  className={cn("h-3.5 w-3.5", isActive ? "text-amber-300" : "text-amber-500/70")}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z" />
                </svg>
              )}
              {tab.label}
              {tab.id === "premium" && premiumActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden />
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
