"use client"

import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { isPremiumActive, type StoredUserProfile } from "@/client/lib/user-profile"
import { PremiumMembershipLuxury } from "@/client/components/premium/premium-membership-luxury"

type ProfilePremiumPanelProps = {
  profile: StoredUserProfile
  onProfileUpdate: (next: StoredUserProfile) => void
}

export function ProfilePremiumPanel({ profile, onProfileUpdate }: ProfilePremiumPanelProps) {
  const [active, setActive] = useState(() => isPremiumActive(profile))

  useEffect(() => {
    setActive(isPremiumActive(profile))
  }, [profile])

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <PremiumMembershipLuxury
        profile={profile}
        variant="page"
        onProfileUpdate={onProfileUpdate}
        showInvisibleControl={active}
      />
    </motion.div>
  )
}
