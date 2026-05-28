"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type Phase = "analyzing" | "detected"

const NODES = [
  { id: "a", cx: 24, cy: 28 },
  { id: "b", cx: 76, cy: 22 },
  { id: "c", cx: 50, cy: 50 },
  { id: "d", cx: 18, cy: 72 },
  { id: "e", cx: 82, cy: 68 },
] as const

const EDGES: ReadonlyArray<[number, number]> = [
  [0, 2],
  [1, 2],
  [2, 3],
  [2, 4],
  [3, 4],
  [0, 3],
  [1, 4],
]

export function AiThinkingVisual() {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState<Phase>("analyzing")

  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => {
      setPhase((p) => (p === "analyzing" ? "detected" : "analyzing"))
    }, 4200)
    return () => window.clearInterval(id)
  }, [reduce])

  return (
    <div
      className={cn(
        "ttm-ai-thinking__viz",
        phase === "detected" && "ttm-ai-thinking__viz--detected"
      )}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="ttm-ai-thinking__svg">
        {EDGES.map(([from, to], i) => {
          const a = NODES[from]
          const b = NODES[to]
          return (
            <line
              key={`${from}-${to}`}
              x1={a.cx}
              y1={a.cy}
              x2={b.cx}
              y2={b.cy}
              className="ttm-ai-thinking__edge"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          )
        })}
        {NODES.map((node) => (
          <circle key={node.id} cx={node.cx} cy={node.cy} r="4" className="ttm-ai-thinking__node" />
        ))}
      </svg>
      <p className="ttm-ai-thinking__status">
        <span className="ttm-ai-thinking__status-analyzing">Analyzing…</span>
        <span className="ttm-ai-thinking__status-detected">Connection detected</span>
      </p>
    </div>
  )
}
