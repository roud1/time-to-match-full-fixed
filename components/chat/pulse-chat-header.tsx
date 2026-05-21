"use client"

import { motion, useReducedMotion } from "motion/react"
import { PulseAvatar } from "@/components/chat/pulse-avatar"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type PulseChatHeaderProps = {
  showTyping?: boolean
  className?: string
}

export function PulseChatHeader({ showTyping, className }: PulseChatHeaderProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section
      className={cn(
        "shrink-0 border-b border-white/[0.08] px-3 py-2.5 bg-[#050506]",
        className
      )}
    >
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl px-3 py-2.5 flex items-center gap-3">
        <PulseAvatar size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/35 font-extralight">
            {t("pulseGuideLabel")}
          </p>
          <p className="text-sm font-extralight text-white/90">Pulse</p>
          <p className="text-[10px] text-violet-200/70 font-extralight mt-0.5">
            {showTyping ? t("pulseAiTyping") : t("pulseAiOnline")}
          </p>
        </div>
        {!reduce && (
          <motion.span
            className="h-2 w-2 rounded-full bg-violet-400/80 shrink-0"
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
        )}
      </div>
    </section>
  )
}
