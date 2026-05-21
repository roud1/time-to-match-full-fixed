"use client"

import { motion, useReducedMotion } from "motion/react"
import type { DiscoverCompatibility } from "@/lib/discover-compatibility"
import {
  getCompatibilityHintLabel,
  getProfileAtmosphereLabel,
} from "@/lib/discover-compatibility"
import { getRelationshipPersonalityLabel } from "@/lib/relationship-identity"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type CompatibilityPreviewProps = {
  compatibility: DiscoverCompatibility
  compact?: boolean
  className?: string
}

export function CompatibilityPreview({
  compatibility,
  compact,
  className,
}: CompatibilityPreviewProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const resonance = compatibility.resonancePercent / 100

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("discover-compat rounded-xl px-2.5 py-2 space-y-1.5", className)}
      style={{ ["--discover-resonance" as string]: resonance }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[8px] uppercase tracking-[0.16em] text-white/35 font-extralight">
          {t("discoverResonanceLabel")}
        </span>
        <span className="text-[11px] tabular-nums font-extralight text-white/85">
          {compatibility.resonancePercent}%
        </span>
      </div>
      <div className="discover-compat__meter">
        <motion.div
          className="discover-compat__meter-fill"
          initial={false}
          animate={{ width: `${compatibility.resonancePercent}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {!compact && (
        <>
          <p className="text-[10px] font-extralight text-white/65 leading-snug">
            {getCompatibilityHintLabel(compatibility.chemistryHint, t)}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className="text-[8px] uppercase tracking-wider text-white/30 font-extralight px-1.5 py-0.5 rounded border border-white/[0.06]">
              {getProfileAtmosphereLabel(compatibility.atmosphere, t)}
            </span>
            <span className="text-[8px] uppercase tracking-wider text-white/40 font-extralight px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.03]">
              {getRelationshipPersonalityLabel(compatibility.previewPersonality, t)}
            </span>
          </div>
        </>
      )}
    </motion.div>
  )
}
