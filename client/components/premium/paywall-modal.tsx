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
      <DialogContent className="ttm-dating-paywall z-[95] max-w-md border border-[rgba(255,46,99,0.28)] bg-[#070a0f]/98 backdrop-blur-2xl p-0 overflow-hidden gap-0">
        <div className="ttm-dating-paywall__accent-line absolute inset-x-0 top-0 h-px pointer-events-none" />
        <DialogHeader className="px-5 pt-5 pb-3 text-left space-y-1 border-b border-white/5">
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground/95">
            {t("paywallTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs font-light text-muted-foreground/90 leading-relaxed">
            {t(hintKey)}
          </DialogDescription>
          <p className="ttm-dating-paywall__urgency">{t("paywallUrgency")}</p>
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
