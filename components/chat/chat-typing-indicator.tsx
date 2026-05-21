"use client"

import { motion } from "motion/react"
import { useReducedMotion } from "motion/react"

export function ChatTypingIndicator() {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
      aria-live="polite"
    >
      <div
        className="inline-flex items-center gap-1.5 px-4 py-3 rounded-[1.35rem] rounded-bl-md border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-[0_12px_40px_-20px_rgba(0,0,0,0.8)]"
        role="status"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-white/35"
            animate={reduce ? { opacity: 0.5 } : { opacity: [0.25, 1, 0.25], scale: [0.85, 1, 0.85] }}
            transition={reduce ? {} : { duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  )
}
