"use client"

import { motion, AnimatePresence } from "motion/react"
import { useReducedMotion } from "motion/react"
import type { ActivityToast } from "@/components/activity/activity-feed-context"
import { cn } from "@/lib/utils"

export function FloatingToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ActivityToast[]
  onDismiss: (id: string) => void
}) {
  const reduce = useReducedMotion()

  return (
    <div
      className="fixed z-[60] left-3 right-3 bottom-[5.75rem] max-w-lg mx-auto flex flex-col gap-2 pointer-events-none sm:bottom-24"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout={!reduce}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="pointer-events-auto rounded-2xl border border-white/12 bg-black/55 backdrop-blur-2xl px-4 py-3 shadow-[0_20px_60px_-24px_rgba(255,255,255,0.45)] flex gap-3 items-start"
          >
            <span
              className={cn(
                "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full",
                toast.variant === "match" && "bg-white/20 ttm-presence-glow-pink",
                toast.variant === "message" && "bg-sky-400 ttm-presence-glow-sky",
                toast.variant === "like" && "bg-amber-300 ttm-presence-glow-amber"
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-light text-foreground/95 leading-snug">{toast.title}</p>
              {toast.body && <p className="text-xs text-muted-foreground font-light mt-1 leading-relaxed">{toast.body}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground text-lg leading-none px-1 touch-manipulation"
              aria-label="Close"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
