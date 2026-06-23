"use client"

import { useEffect, useMemo, useState } from "react"
import { useHydrated } from "@/client/hooks/use-hydrated"

type Particle = { id: number; x: number; y: number; size: number; delay: number; duration: number }

function particleAt(index: number): Particle {
  const frac = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453
    return x - Math.floor(x)
  }
  return {
    id: index,
    x: frac(1) * 100,
    y: frac(2) * 100,
    size: 1 + frac(3) * 2.5,
    delay: frac(4) * 4,
    duration: 6 + frac(5) * 8,
  }
}

/** CSS-driven particles — same look, far less JS than per-node Framer Motion. */
export function CinematicParticles({ count = 24, className = "" }: { count?: number; className?: string }) {
  const hydrated = useHydrated()
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  const particles = useMemo(() => Array.from({ length: count }, (_, i) => particleAt(i)), [count])

  if (!hydrated || reduceMotion) return null

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="ttm-cinematic-particle absolute rounded-full bg-white/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
