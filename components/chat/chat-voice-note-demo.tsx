"use client"

import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { useReducedMotion } from "motion/react"

function barsFromSeed(seed: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
    const f = x - Math.floor(x)
    return 0.25 + f * 0.75
  })
}

export function ChatVoiceNoteDemo({ seed, durationLabel, demoLabel }: { seed: number; durationLabel: string; demoLabel: string }) {
  const reduce = useReducedMotion()
  const heights = useMemo(() => barsFromSeed(seed, 28), [seed])
  const [playing, setPlaying] = useState(false)

  return (
    <div className="rounded-2xl border border-sky-500/25 bg-sky-500/[0.06] backdrop-blur-xl px-3 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="shrink-0 h-11 w-11 rounded-full border border-sky-400/35 bg-sky-500/20 text-sky-100 flex items-center justify-center touch-manipulation active:scale-95 transition-transform shadow-[0_0_24px_-6px_rgba(56,189,248,0.45)]"
          aria-label={demoLabel}
        >
          {playing ? (
            <span className="flex gap-0.5">
              <span className="w-1 h-3.5 bg-current rounded-sm" />
              <span className="w-1 h-3.5 bg-current rounded-sm" />
            </span>
          ) : (
            <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-0.5 h-10 px-1">
          {heights.map((h, i) => {
            const px = 4 + h * 22
            return (
              <motion.span
                key={i}
                className="w-0.5 rounded-full bg-sky-300/55 shrink-0"
                style={{ height: px }}
                animate={
                  playing && !reduce
                    ? { opacity: [0.35, 1, 0.4], height: [px * 0.45, px * 1.05, px * 0.55] }
                    : { opacity: 0.5, height: px }
                }
                transition={
                  playing && !reduce
                    ? { duration: 0.75 + (i % 4) * 0.05, repeat: Infinity, delay: i * 0.04, ease: "easeInOut" }
                    : { duration: 0.2 }
                }
              />
            )
          })}
        </div>
        <span className="text-[11px] tabular-nums text-sky-100/80 font-light shrink-0">{durationLabel}</span>
      </div>
      <p className="text-[9px] text-center text-muted-foreground/70 mt-2 font-light">{demoLabel}</p>
    </div>
  )
}
