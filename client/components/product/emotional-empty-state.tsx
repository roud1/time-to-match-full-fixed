"use client"

import { motion, useReducedMotion } from "motion/react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/client/lib/utils"

type EmotionalEmptyStateProps = {
  title: string
  body: string
  icon?: LucideIcon
  className?: string
  action?: React.ReactNode
}

export function EmotionalEmptyState({
  title,
  body,
  icon: Icon,
  className,
  action,
}: EmotionalEmptyStateProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={cn("p9-empty ttm-brand-glass", className)}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {Icon && (
        <div className="p9-empty__icon" aria-hidden>
          <Icon className="w-5 h-5 text-white/90" strokeWidth={1.25} />
        </div>
      )}
      <p className="p9-empty__title">{title}</p>
      <p className="p9-empty__body">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
