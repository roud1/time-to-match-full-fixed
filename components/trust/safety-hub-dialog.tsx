"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useI18n } from "@/lib/i18n"
import {
  REPORT_REASON_KEYS,
  blockProfile,
  isProfileMuted,
  muteProfile,
  submitReport,
  unmuteProfile,
} from "@/lib/trust-safety-store"
import { blockUserOnServer, submitReportOnServer } from "@/lib/trust-safety-api"
import { unmatchOnServer } from "@/lib/match-unmatch-client"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PremiumButton } from "@/components/ui/premium-button"

type View = "menu" | "report" | "report-done" | "block-confirm" | "unmatch-confirm"

export function SafetyHubDialog({
  open,
  onOpenChange,
  profileId,
  profileName,
  serverUserId,
  context,
  onAfterBlock,
  onAfterUnmatch,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  profileId: number
  profileName: string
  /** Server UUID when in production mode */
  serverUserId?: string | null
  context: "discover" | "chat"
  onAfterBlock?: () => void
  onAfterUnmatch?: () => void
}) {
  const { t } = useI18n()
  const [view, setView] = useState<View>("menu")
  const [reason, setReason] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    if (open) {
      setView("menu")
      setReason(null)
      setMuted(isProfileMuted(profileId))
    }
  }, [open, profileId])

  const close = () => onOpenChange(false)

  const handleBlock = () => {
    blockProfile(profileId)
    if (serverUserId) {
      void blockUserOnServer({ blockedUserId: serverUserId, action: "block" })
    }
    onAfterBlock?.()
    close()
  }

  const handleUnmatch = () => {
    void unmatchOnServer(profileId)
    onAfterUnmatch?.()
    close()
  }

  const handleReport = () => {
    if (!reason) return
    submitReport(profileId, reason)
    if (serverUserId) {
      void submitReportOnServer({ reportedUserId: serverUserId, reasonKey: reason })
    }
    setView("report-done")
  }

  const toggleMute = () => {
    if (muted) {
      unmuteProfile(profileId)
      setMuted(false)
    } else {
      muteProfile(profileId)
      setMuted(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-[min(100%-1.5rem,420px)] rounded-[1.35rem] border border-white/12 bg-[#0a0a10]/95 backdrop-blur-2xl shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] gap-0 p-0 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="p-6"
          >
            {view === "menu" && (
              <>
                <DialogHeader className="text-left space-y-2 pb-2">
                  <DialogTitle className="text-lg font-extralight tracking-tight text-foreground/95">
                    {t("trustSafetyTitle")}
                  </DialogTitle>
                  <DialogDescription className="text-sm font-light text-muted-foreground/90 leading-relaxed">
                    {t("trustSafetySubtitle")}{" "}
                    <span className="text-foreground/80 font-light">{profileName}</span>
                  </DialogDescription>
                </DialogHeader>
                <p className="text-[11px] font-light text-sky-200/75 border border-sky-500/20 rounded-xl px-3 py-2.5 bg-sky-500/[0.06] mb-4">
                  {t("trustSafetyReassurance")}
                </p>
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setView("report")}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left text-sm font-light hover:bg-white/[0.07] hover:border-white/14 transition-colors touch-manipulation"
                  >
                    <span className="block text-foreground/95">{t("trustActionReport")}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{t("trustActionReportHint")}</span>
                  </button>
                  {context === "chat" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setView("unmatch-confirm")}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left text-sm font-light hover:bg-white/[0.07] transition-colors touch-manipulation"
                      >
                        <span className="block text-foreground/95">{t("trustActionUnmatch")}</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">{t("trustActionUnmatchHint")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left text-sm font-light hover:bg-white/[0.07] transition-colors touch-manipulation"
                      >
                        <span className="block text-foreground/95">{muted ? t("trustActionUnmute") : t("trustActionMute")}</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">{t("trustActionMuteHint")}</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setView("block-confirm")}
                    className="w-full rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] px-4 py-3.5 text-left text-sm font-light text-rose-100/95 hover:bg-rose-500/[0.1] transition-colors touch-manipulation"
                  >
                    <span className="block">{t("trustActionBlock")}</span>
                    <span className="block text-xs text-rose-200/70 mt-0.5 font-extralight">{t("trustActionBlockHint")}</span>
                  </button>
                </div>
              </>
            )}

            {view === "report" && (
              <>
                <DialogHeader className="text-left space-y-2 pb-3">
                  <DialogTitle className="text-lg font-extralight tracking-tight">{t("trustReportTitle")}</DialogTitle>
                  <DialogDescription className="text-sm font-light">{t("trustReportSubtitle")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 mb-5">
                  {REPORT_REASON_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setReason(key)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left text-sm font-light transition-colors touch-manipulation",
                        reason === key
                          ? "border-white/20 bg-white/08 text-white/90"
                          : "border-white/10 bg-white/[0.03] text-foreground/90 hover:border-white/18"
                      )}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
                <DialogFooter className="flex-col sm:flex-col gap-2">
                  <PremiumButton type="button" disabled={!reason} onClick={handleReport} className="w-full rounded-2xl">
                    {t("trustReportSubmit")}
                  </PremiumButton>
                  <button
                    type="button"
                    onClick={() => setView("menu")}
                    className="w-full py-2.5 text-sm font-light text-muted-foreground hover:text-foreground/80"
                  >
                    {t("trustBack")}
                  </button>
                </DialogFooter>
              </>
            )}

            {view === "report-done" && (
              <div className="text-center py-2 space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full border border-emerald-500/35 bg-emerald-500/10 flex items-center justify-center ttm-trust-check-glow">
                  <svg className="w-7 h-7 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <DialogTitle className="text-lg font-extralight">{t("trustReportThanksTitle")}</DialogTitle>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{t("trustReportThanksBody")}</p>
                <PremiumButton type="button" variant="ghost" onClick={close} className="w-full rounded-2xl">
                  {t("trustClose")}
                </PremiumButton>
              </div>
            )}

            {view === "unmatch-confirm" && (
              <>
                <DialogHeader className="text-left space-y-2 pb-3">
                  <DialogTitle className="text-lg font-extralight tracking-tight">{t("trustUnmatchConfirmTitle")}</DialogTitle>
                  <DialogDescription className="text-sm font-light leading-relaxed">{t("trustUnmatchConfirmBody")}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col gap-2 sm:flex-col">
                  <button
                    type="button"
                    onClick={handleUnmatch}
                    className="w-full rounded-2xl border border-amber-500/35 bg-amber-500/15 py-3 text-sm font-light text-amber-50 hover:bg-amber-500/25 transition-colors touch-manipulation"
                  >
                    {t("trustUnmatchConfirmCta")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("menu")}
                    className="w-full py-2.5 text-sm font-light text-muted-foreground hover:text-foreground/80 touch-manipulation"
                  >
                    {t("trustCancel")}
                  </button>
                </DialogFooter>
              </>
            )}

            {view === "block-confirm" && (
              <>
                <DialogHeader className="text-left space-y-2 pb-3">
                  <DialogTitle className="text-lg font-extralight tracking-tight">{t("trustBlockConfirmTitle")}</DialogTitle>
                  <DialogDescription className="text-sm font-light leading-relaxed">{t("trustBlockConfirmBody")}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col gap-2 sm:flex-col">
                  <button
                    type="button"
                    onClick={handleBlock}
                    className="w-full rounded-2xl border border-rose-500/35 bg-rose-500/15 py-3 text-sm font-light text-rose-100 hover:bg-rose-500/25 transition-colors touch-manipulation"
                  >
                    {t("trustBlockConfirmCta")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("menu")}
                    className="w-full py-2.5 text-sm font-light text-muted-foreground hover:text-foreground/80 touch-manipulation"
                  >
                    {t("trustCancel")}
                  </button>
                </DialogFooter>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
