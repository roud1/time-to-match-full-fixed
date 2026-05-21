"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import type { ShareMoment } from "@/lib/shared/share-moments"
import { copyShareMoment, shareMomentNative } from "@/lib/shared/share-moments"
import { trackProductEvent } from "@/lib/analytics-client"
import { CinematicButton } from "@/components/ui/cinematic-button"
import { Share2, Copy, ImageDown } from "lucide-react"
import { downloadShareMomentPng } from "@/lib/share-card-image"
import { cn } from "@/lib/utils"

type ShareSyncCardProps = {
  moment: ShareMoment
  className?: string
  onClose?: () => void
}

export function ShareSyncCard({ moment, className, onClose }: ShareSyncCardProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [copied, setCopied] = useState(false)
  const [savingPng, setSavingPng] = useState(false)

  const handleShare = async () => {
    const ok = await shareMomentNative(moment)
    trackProductEvent("share_moment", { kind: moment.kind, native: ok })
    if (!ok) {
      const c = copyShareMoment(moment)
      if (c) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
    onClose?.()
  }

  const handlePng = async () => {
    setSavingPng(true)
    try {
      await downloadShareMomentPng(moment)
      trackProductEvent("share_moment_png", { kind: moment.kind })
    } catch {
      /* ignore */
    } finally {
      setSavingPng(false)
    }
  }

  const handleCopy = () => {
    if (copyShareMoment(moment)) {
      setCopied(true)
      trackProductEvent("share_moment_copy", { kind: moment.kind })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("p10-share-card text-center", className)}
      data-rel-state={moment.state}
    >
      <div className="p10-share-card__ring tabular-nums">{moment.syncPercent}%</div>
      <p className="text-sm font-extralight text-white/90 mb-1">{moment.title}</p>
      <p className="text-xs font-light text-white/50 mb-1">{moment.subtitle}</p>
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 mb-5">{moment.partnerName}</p>
      <div className="flex flex-col gap-2 justify-center">
        <CinematicButton variant="primary" className="min-h-[44px] gap-2 w-full" onClick={() => void handleShare()}>
          <Share2 className="w-4 h-4" strokeWidth={1.25} />
          {t("shareMomentCta")}
        </CinematicButton>
        <div className="flex flex-col sm:flex-row gap-2">
          <CinematicButton
            variant="secondary"
            className="min-h-[44px] gap-2 flex-1"
            disabled={savingPng}
            onClick={() => void handlePng()}
          >
            <ImageDown className="w-4 h-4" strokeWidth={1.25} />
            {savingPng ? t("shareMomentPngSaving") : t("shareMomentPng")}
          </CinematicButton>
          <CinematicButton variant="ghost" className="min-h-[44px] gap-2 flex-1" onClick={handleCopy}>
            <Copy className="w-4 h-4" strokeWidth={1.25} />
            {copied ? t("shareMomentCopied") : t("shareMomentCopy")}
          </CinematicButton>
        </div>
      </div>
    </motion.div>
  )
}
