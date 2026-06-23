"use client"

import { motion, useReducedMotion } from "motion/react"
import type { RelationshipPersonality } from "@/client/lib/relationship-identity/types"
import { getRelationshipPersonalityLabel, normalizePersonality } from "@/client/lib/relationship-identity"
import type { AnyConnectionPersonality } from "@/client/lib/relationship-identity/types"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type ConnectionPersonalityBadgeProps = {
  personality: RelationshipPersonality | AnyConnectionPersonality
  className?: string
}

const TONE: Record<RelationshipPersonality, string> = {
  slow_burn: "border-amber-400/20 text-amber-100/70",
  deep_sync: "border-indigo-400/25 text-indigo-200/75",
  emotional_chaos: "border-rose-400/25 text-rose-200/65",
  calm_connection: "border-slate-400/20 text-slate-200/60",
  magnetic_chemistry: "border-violet-400/30 text-violet-200/80",
  night_energy: "border-blue-400/25 text-blue-200/70",
  stable_bond: "border-emerald-400/20 text-emerald-200/70",
  intense_attraction: "border-pink-400/30 text-pink-200/75",
}

export function ConnectionPersonalityBadge({
  personality,
  className,
}: ConnectionPersonalityBadgeProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const p = normalizePersonality(personality)

  return (
    <motion.span
      layout
      initial={reduce ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[8px] uppercase tracking-[0.14em] font-extralight backdrop-blur-md",
        TONE[p],
        className
      )}
      data-rel-personality={p}
    >
      {getRelationshipPersonalityLabel(p, t)}
    </motion.span>
  )
}
