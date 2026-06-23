"use client"

import type { LucideIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/client/lib/utils"

export type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      role="status"
      className={cn(
        "ttm-empty-state px-6 py-8 text-center",
        className
      )}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {Icon && (
        <div
          className="ttm-empty-state__icon mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={1.25} />
        </div>
      )}
      <p className="ttm-empty-state__title text-base font-extralight tracking-tight">{title}</p>
      {description && (
        <p className="ttm-empty-state__desc mt-2 text-sm font-light leading-relaxed max-w-xs mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </motion.div>
  )
}
