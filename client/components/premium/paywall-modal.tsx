"use client"

import { useEffect } from "react"
import { useI18n } from "@/client/lib/i18n"
import { getUserProfile, isPremiumActive } from "@/client/lib/user-profile"
import type { PremiumUpgradeHint } from "@/client/lib/premium-upgrade-hints"
import { PremiumMembershipLuxury } from "@/client/components/premium/premium-membership-luxury"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import { motion, AnimatePresence } from "motion/react"
import { trackProductEvent } from "@/client/lib/analytics-client"
import { usePremiumUpgrade } from "@/client/components/premium/premium-upgrade-context"

function hintCopyKey(
  h: PremiumUpgradeHint | null
):
  | "premiumSheetHintDefault"
  | "premiumSheetHintRewind"
  | "premiumSheetHintBoost"
  | "premiumSheetHintLikes"
  | "premiumSheetHintLikedYou"
  | "premiumSheetHintMap"
  | "premiumSheetHintTimer" {
  switch (h) {
    case "rewind":
      return "premiumSheetHintRewind"
    case "boost":
      return "premiumSheetHintBoost"
    case "likes":
      return "premiumSheetHintLikes"
    case "likedYou":
      return "premiumSheetHintLikedYou"
    case "map":
      return "premiumSheetHintMap"
    case "timer":
      return "premiumSheetHintTimer"
    default:
      return "premiumSheetHintDefault"
  }
}

/** Centered paywall — likes limit, who liked you, and other monetization gates. */
export function PaywallModal() {
  const { t } = useI18n()
  const { modalOpen, closePaywall, hint, profileVersion, openPaywall } = usePremiumUpgrade()
  const profile = getUserProfile()
  const premium = Boolean(profile && isPremiumActive(profile))

  useEffect(() => {
    const onPaywall = (e: Event) => {
      const detail = (e as CustomEvent<{ hint?: PremiumUpgradeHint }>).detail
      openPaywall(detail?.hint ?? "likes")
    }
    window.addEventListener("ttm-open-paywall", onPaywall)
    return () => window.removeEventListener("ttm-open-paywall", onPaywall)
  }, [openPaywall])

  useEffect(() => {
    if (premium && modalOpen) closePaywall()
  }, [premium, modalOpen, closePaywall])

  const hintKey = hintCopyKey(hint)
  void profileVersion
  const open = Boolean(profile && modalOpen && !premium)

  useEffect(() => {
    if (open) {
      trackProductEvent("paywall_view", { hint: hint ?? "default" })
    }
  }, [open, hint])

  if (!profile) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) closePaywall()
      }}
    >
      <DialogContent className="lv-paywall z-[95] max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="lv-paywall__head">
          <DialogTitle className="lv-paywall__title">{t("paywallTitle")}</DialogTitle>
          <DialogDescription className="lv-paywall__hint">{t(hintKey)}</DialogDescription>
        </DialogHeader>
        <AnimatePresence>
          {open && (
            <motion.div
              key="paywall"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <PremiumMembershipLuxury
                profile={profile}
                variant="sheet"
                onProfileUpdate={() => {
                  closePaywall()
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
