"use client"

import { motion, useReducedMotion } from "motion/react"
import type { MirrorLine } from "@/lib/intelligence"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function PersonalityMirrorCard({
  lines,
  className,
}: {
  lines: MirrorLine[]
  className?: string
}) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  if (lines.length === 0) return null

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("p14-mirror-card", className)}
    >
      <p className="p14-mirror-card__eyebrow">{t("intelMirrorEyebrow")}</p>
      <ul className="p14-mirror-card__list">
        {lines.map((line) => (
          <li key={line.id} className="p14-mirror-card__line">
            {t(line.textKey)}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
