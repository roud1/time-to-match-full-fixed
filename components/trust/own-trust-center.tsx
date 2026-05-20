"use client"

import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { getOwnTrustPresentation } from "@/lib/demo-trust-signals"
import {
  getTrustSafetyState,
  setOwnEmailVerified,
  setOwnPhotoStatus,
  unblockProfile,
} from "@/lib/trust-safety-store"
import { PremiumButton } from "@/components/ui/premium-button"
import { cn } from "@/lib/utils"
import { useTrustSafetyVersion } from "@/hooks/use-trust-safety-version"

export function OwnTrustCenter({
  profileStrength,
}: {
  profileStrength: number
}) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const trustV = useTrustSafetyVersion()
  const [photoBusy, setPhotoBusy] = useState(false)

  const state = useMemo(() => getTrustSafetyState(), [trustV])
  const { emailDone, photoStatus } = state.ownVerification
  const trustScore = getOwnTrustPresentation(profileStrength, emailDone, photoStatus)

  const startPhotoDemo = () => {
    setPhotoBusy(true)
    setOwnPhotoStatus("pending", Date.now())
    window.setTimeout(() => {
      setOwnPhotoStatus("verified", Date.now())
      setPhotoBusy(false)
    }, reduce ? 400 : 2200)
  }

  const blocked = state.blockedIds

  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-gradient-to-br from-slate-500/[0.07] via-transparent to-pink-500/[0.06] backdrop-blur-xl p-5 mb-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-light mb-1">{t("trustOwnHubTitle")}</p>
          <p className="text-sm font-light text-foreground/90 leading-snug">{t("trustOwnHubSubtitle")}</p>
        </div>
        <div className="relative shrink-0 w-16 h-16 rounded-2xl border border-pink-500/25 bg-black/30 flex items-center justify-center">
          <span className="text-2xl font-extralight tabular-nums text-pink-100">{trustScore}</span>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-light text-muted-foreground whitespace-nowrap">
            {t("trustOwnScoreLabel")}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-light text-foreground/95">{t("trustStepEmailTitle")}</p>
            <p className="text-xs text-muted-foreground font-light mt-0.5">{t("trustStepEmailBody")}</p>
          </div>
          {emailDone ? (
            <span className="text-xs font-light text-emerald-300/95 shrink-0">{t("trustStepDone")}</span>
          ) : (
            <PremiumButton type="button" size="mobile" variant="secondary" className="shrink-0 rounded-xl px-3 py-2 text-xs" onClick={() => setOwnEmailVerified(true)}>
              {t("trustStepEmailCta")}
            </PremiumButton>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-light text-foreground/95">{t("trustStepPhotoTitle")}</p>
              <p className="text-xs text-muted-foreground font-light mt-0.5">{t("trustStepPhotoBody")}</p>
            </div>
            {photoStatus === "verified" && <span className="text-xs font-light text-emerald-300/95 shrink-0">{t("trustStepDone")}</span>}
          </div>
          {photoStatus !== "verified" && (
            <PremiumButton
              type="button"
              size="mobile"
              variant="glow"
              disabled={photoBusy || photoStatus === "pending"}
              className="w-full rounded-xl"
              onClick={startPhotoDemo}
            >
              {photoBusy || photoStatus === "pending" ? t("trustStepPhotoLoading") : t("trustStepPhotoCta")}
            </PremiumButton>
          )}
          {photoStatus === "pending" && !photoBusy && (
            <p className="text-[11px] text-sky-200/80 font-light">{t("trustStepPhotoPending")}</p>
          )}
        </div>
      </div>

      {blocked.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-light mb-2">{t("trustBlockedListTitle")}</p>
          <ul className="space-y-2">
            {blocked.map((id) => (
              <li key={id} className="flex items-center justify-between gap-2 text-sm font-light">
                <span className="text-foreground/80">{t("trustBlockedUser")} #{id}</span>
                <button
                  type="button"
                  onClick={() => {
                    unblockProfile(id)
                  }}
                  className="text-xs text-pink-300/90 hover:text-pink-200 touch-manipulation"
                >
                  {t("trustUnblock")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <motion.p
        layout
        className={cn("text-[11px] text-center font-light text-muted-foreground/85 leading-relaxed", !reduce && "ttm-trust-copy-fade")}
      >
        {t("trustOwnFooter")}
      </motion.p>
    </div>
  )
}
