"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { buildInvitePayload, copyInviteLink, shareInviteNative } from "@/lib/network"
import { CinematicButton } from "@/components/ui/cinematic-button"
import { trackProductEvent } from "@/lib/analytics-client"
import { cn } from "@/lib/utils"

type CinematicInviteFlowProps = {
  className?: string
}

export function CinematicInviteFlow({ className }: CinematicInviteFlowProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [copied, setCopied] = useState(false)
  const payload = buildInvitePayload()

  const handleCopy = async () => {
    const ok = await copyInviteLink()
    if (ok) {
      setCopied(true)
      trackProductEvent("invite_copy")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    const ok = await shareInviteNative()
    trackProductEvent("invite_share", { native: ok })
    if (!ok) void handleCopy()
  }

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("p13-invite-flow", className)}
    >
      <div className="p13-invite-flow__glow" aria-hidden />
      <p className="p13-invite-flow__eyebrow">{t("netInviteEyebrow")}</p>
      <h2 className="p13-invite-flow__title">{t("netInviteTitle")}</h2>
      <p className="p13-invite-flow__body">{t("netInviteBody")}</p>
      <p className="p13-invite-flow__code tabular-nums">{payload.code}</p>
      <div className="flex flex-col gap-2 mt-6">
        <CinematicButton variant="primary" className="w-full min-h-[44px]" onClick={() => void handleShare()}>
          {t("netInviteCta")}
        </CinematicButton>
        <CinematicButton variant="secondary" className="w-full min-h-[44px]" onClick={() => void handleCopy()}>
          {copied ? t("netInviteCopied") : t("netInviteCopy")}
        </CinematicButton>
      </div>
    </motion.section>
  )
}
