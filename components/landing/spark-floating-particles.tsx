"use client"

import { useMemo } from "react"
import { useReducedMotion } from "motion/react"

const COUNT = 36

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

function fixed(value: number, digits = 4) {
  return value.toFixed(digits)
}

export function SparkFloatingParticles() {
  const reduce = useReducedMotion()

  const particles = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        left: `${fixed(seededRandom(i + 1) * 100, 4)}%`,
        size: `${fixed(2 + seededRandom(i + 2) * 3, 4)}px`,
        delay: `${fixed(seededRandom(i + 3) * 12, 4)}s`,
        duration: `${fixed(14 + seededRandom(i + 4) * 16, 4)}s`,
        opacity: fixed(0.25 + seededRandom(i + 5) * 0.55, 6),
      })),
    []
  )

  if (reduce) return null

  return (
    <div className="spark-particles" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="spark-particles__dot"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  )
}
