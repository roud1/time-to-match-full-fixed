"use client"

import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { isPremiumActive, type StoredUserProfile } from "@/client/lib/user-profile"
import { PremiumMembershipLuxury } from "@/client/components/premium/premium-membership-luxury"
import { activateProfileBoost } from "@/client/lib/monetization/api"
import { PremiumButton } from "@/client/components/ui/premium-button"
import { useI18n } from "@/client/lib/i18n"

type ProfilePremiumPanelProps = {
  profile: StoredUserProfile
  onProfileUpdate: (next: StoredUserProfile) => void
}

export function ProfilePremiumPanel({ profile, onProfileUpdate }: ProfilePremiumPanelProps) {
  const { t } = useI18n()
  const [active, setActive] = useState(() => isPremiumActive(profile))
  const [boostLoading, setBoostLoading] = useState(false)

  useEffect(() => {
    setActive(isPremiumActive(profile))
  }, [profile])

  const handleBoost = async () => {
    setBoostLoading(true)
    try {
      const result = await activateProfileBoost()
      if ("url" in result && result.url) {
        window.location.href = result.url
      }
    } finally {
      setBoostLoading(false)
    }
  }

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <PremiumMembershipLuxury
        profile={profile}
        variant="page"
        onProfileUpdate={onProfileUpdate}
        showInvisibleControl={active}
      />
      <div className="rounded-2xl border border-border/60 bg-card/40 p-4 space-y-3">
        <p className="text-sm text-muted-foreground">{t("premiumFeatureBoost")}</p>
        <PremiumButton type="button" disabled={boostLoading} onClick={() => void handleBoost()}>
          {boostLoading ? "…" : t("premiumBoostChip")}
        </PremiumButton>
      </div>
    </motion.div>
  )
}
