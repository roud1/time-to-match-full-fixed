"use client"

import { useEffect } from "react"
import { useI18n } from "@/client/lib/i18n"
import { getUserProfile, isPremiumActive } from "@/client/lib/user-profile"
import type { PremiumUpgradeHint } from "@/client/lib/premium-upgrade-hints"
import { PremiumMembershipLuxury } from "@/client/components/premium/premium-membership-luxury"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/client/components/ui/sheet"
import { motion, AnimatePresence } from "motion/react"
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

export function PremiumUpgradeSheet() {
  const { t } = useI18n()
  const { sheetOpen, closeUpgrade, hint, profileVersion } = usePremiumUpgrade()
  const profile = getUserProfile()
  const premium = Boolean(profile && isPremiumActive(profile))

  useEffect(() => {
    if (premium && sheetOpen) closeUpgrade()
  }, [premium, sheetOpen, closeUpgrade])

  const hintKey = hintCopyKey(hint)
  void profileVersion

  if (!profile) return null

  const open = sheetOpen && !premium

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) closeUpgrade()
      }}
    >
      <SheetContent
        side="bottom"
        className="lv-paywall lv-paywall--sheet z-[90] max-h-[min(92dvh,720px)] p-0 overflow-hidden"
      >
        <div className="lv-paywall__grabber" aria-hidden />
        <SheetHeader className="lv-paywall__head">
          <SheetTitle className="lv-paywall__title">{t("premiumSheetTitle")}</SheetTitle>
          <SheetDescription className="lv-paywall__hint">{t(hintKey)}</SheetDescription>
        </SheetHeader>
        <AnimatePresence>
          {open && (
            <motion.div
              key="lux"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <PremiumMembershipLuxury
                profile={profile}
                variant="sheet"
                onProfileUpdate={() => {
                  closeUpgrade()
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  )
}
