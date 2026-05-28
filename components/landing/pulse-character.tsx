"use client"

import { motion, useReducedMotion } from "motion/react"
import { useState } from "react"
import { cn } from "@/lib/utils"

type PulseCharacterProps = {
  className?: string
  size?: "hero" | "compact" | "mini"
}

export function PulseCharacter({ className, size = "hero" }: PulseCharacterProps) {
  const reduce = useReducedMotion()
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className={cn(
        "ttm-pulse",
        size === "compact" && "ttm-pulse--compact",
        size === "mini" && "ttm-pulse--mini",
        className
      )}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      aria-hidden
    >
      <motion.div
        className="ttm-pulse__aura ttm-pulse__aura--far"
        animate={
          reduce
            ? undefined
            : {
                scale: hovered ? 1.18 : [1, 1.1, 1],
                opacity: hovered ? 0.7 : [0.25, 0.45, 0.25],
              }
        }
        transition={
          hovered
            ? { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
            : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className="ttm-pulse__aura ttm-pulse__aura--near"
        animate={
          reduce
            ? undefined
            : {
                scale: hovered ? 1.12 : [1, 1.06, 1],
                opacity: hovered ? 0.85 : [0.4, 0.65, 0.4],
              }
        }
        transition={
          hovered
            ? { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }
        }
      />

      <motion.div
        className="ttm-pulse__blob-wrap"
        animate={
          reduce
            ? undefined
            : {
                scale: hovered ? 1.08 : [1, 1.04, 1],
              }
        }
        transition={
          hovered
            ? { type: "spring", stiffness: 280, damping: 20 }
            : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <motion.div
          className="ttm-pulse__blob"
          animate={
            reduce
              ? undefined
              : {
                  borderRadius: hovered
                    ? "58% 42% 48% 52% / 52% 48% 55% 45%"
                    : [
                        "58% 42% 62% 38% / 48% 55% 45% 52%",
                        "45% 55% 38% 62% / 55% 42% 58% 45%",
                        "62% 38% 55% 45% / 42% 58% 48% 52%",
                        "58% 42% 62% 38% / 48% 55% 45% 52%",
                      ],
                }
          }
          transition={
            hovered
              ? { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
              : { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <span className="ttm-pulse__blob-shine" />
          <span className="ttm-pulse__blob-core" />
        </motion.div>
      </motion.div>

      {!reduce && (
        <>
          <motion.span
            className="ttm-pulse__spark ttm-pulse__spark--a"
            animate={{ rotate: 360, scale: hovered ? 1.3 : 1 }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 0.35 },
            }}
          />
          <motion.span
            className="ttm-pulse__spark ttm-pulse__spark--b"
            animate={{ rotate: -360, scale: hovered ? 1.2 : 1 }}
            transition={{
              rotate: { duration: 26, repeat: Infinity, ease: "linear" },
              scale: { duration: 0.35 },
            }}
          />
        </>
      )}
    </motion.div>
  )
}
