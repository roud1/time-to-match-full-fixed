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
    <div className="lv-set__tabs lv-set__tabs--two mb-4" role="tablist">
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn("lv-set__tab", isActive && "is-active")}
          >
            <span className="relative flex items-center justify-center gap-1.5">
              {tab.id === "premium" && (
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z" />
                </svg>
              )}
              {tab.label}
              {tab.id === "premium" && premiumActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
