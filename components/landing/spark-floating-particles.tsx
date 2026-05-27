"use client"

import { useMemo } from "react"
import { useReducedMotion } from "motion/react"

const COUNT = 36

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

export function SparkFloatingParticles() {
  const reduce = useReducedMotion()

  const particles = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        left: `${seededRandom(i + 1) * 100}%`,
        size: 2 + seededRandom(i + 2) * 3,
        delay: `${seededRandom(i + 3) * 12}s`,
        duration: `${14 + seededRandom(i + 4) * 16}s`,
        opacity: 0.25 + seededRandom(i + 5) * 0.55,
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
