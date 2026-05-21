"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ConnectionAuraProfile, RelationshipIdentity } from "@/lib/relationship-identity/types"
import { getRelationshipPersonalityLabel } from "@/lib/relationship-identity"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type RelationshipIdentityStripProps = {
  identity: RelationshipIdentity
  aura: ConnectionAuraProfile
  className?: string
}

export function RelationshipIdentityStrip({
  identity,
  aura,
  className,
}: RelationshipIdentityStripProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5 backdrop-blur-md",
        className
      )}
      data-rel-personality={aura.personality}
    >
      <span
        className="h-2 w-2 rounded-full shrink-0"
        style={{ boxShadow: `0 0 10px ${aura.glow}` }}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-[8px] uppercase tracking-[0.18em] text-white/30 font-extralight">
          {t("relIdentityLabel")}
        </p>
        <p className="text-[10px] font-extralight text-white/72 truncate">
          {getRelationshipPersonalityLabel(identity.personality, t)}
        </p>
      </div>
      <span className="text-[9px] tabular-nums text-white/35 font-extralight ml-auto shrink-0">
        {Math.round(identity.evolutionProgress * 100)}%
      </span>
    </motion.div>
  )
}
