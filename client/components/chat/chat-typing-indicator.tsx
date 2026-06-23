"use client"

import { motion } from "motion/react"
import { useReducedMotion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"

type ChatTypingIndicatorProps = {
  label?: string
}

export function ChatTypingIndicator({ label }: ChatTypingIndicatorProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const statusText = label ?? t("chatPartnerTypingGeneric")

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className="flex flex-col items-start gap-1.5"
      aria-live="polite"
    >
      {label && (
        <p className="text-[10px] font-extralight tracking-wide text-white/40 pl-1">{statusText}</p>
      )}
      <div
        className="inline-flex items-center gap-1.5 px-4 py-3 rounded-[1.35rem] rounded-bl-md border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-[0_12px_40px_-20px_rgba(0,0,0,0.8)]"
        role="status"
        aria-label={statusText}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-indigo-300/70"
            animate={
              reduce
                ? { opacity: 0.55 }
                : {
                    opacity: [0.2, 1, 0.2],
                    y: [0, -3, 0],
                    scale: [0.8, 1.05, 0.8],
                  }
            }
            transition={
              reduce
                ? {}
                : {
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.14,
                    ease: [0.45, 0, 0.55, 1],
                  }
            }
          />
        ))}
      </div>
    </motion.div>
  )
}
