"use client"

import { useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { getUserProfile, isPremiumActive } from "@/lib/user-profile"
import type { PremiumUpgradeHint } from "@/lib/premium-upgrade-hints"
import { PremiumMembershipLuxury } from "@/components/premium/premium-membership-luxury"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { motion, AnimatePresence } from "motion/react"
import { usePremiumUpgrade } from "@/components/premium/premium-upgrade-context"

function hintCopyKey(
  h: PremiumUpgradeHint | null
):
  | "premiumSheetHintDefault"
  | "premiumSheetHintRewind"
  | "premiumSheetHintBoost"
  | "premiumSheetHintLikes"
  | "premiumSheetHintMap"
  | "premiumSheetHintTimer" {
  switch (h) {
    case "rewind":
      return "premiumSheetHintRewind"
    case "boost":
      return "premiumSheetHintBoost"
    case "likes":
      return "premiumSheetHintLikes"
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
        className="z-[90] max-h-[min(92dvh,720px)] rounded-t-[1.85rem] border border-amber-500/20 border-b-0 bg-[#050506]/98 backdrop-blur-2xl p-0 shadow-[0_-40px_120px_-30px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />
        <div className="mx-auto w-12 h-1 rounded-full bg-white/15 mt-3 mb-1 shrink-0" aria-hidden />
        <SheetHeader className="px-5 pt-2 pb-1 text-left space-y-1 border-b border-white/5">
          <SheetTitle className="text-lg font-extralight tracking-tight text-foreground/95">{t("premiumSheetTitle")}</SheetTitle>
          <SheetDescription className="text-xs font-light text-muted-foreground/90 leading-relaxed">{t(hintKey)}</SheetDescription>
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
