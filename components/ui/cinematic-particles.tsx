"use client"

import { motion, useReducedMotion } from "motion/react"
import { useMemo } from "react"

type Particle = { id: number; x: number; y: number; size: number; delay: number; duration: number }

export function CinematicParticles({ count = 24, className = "" }: { count?: number; className?: string }) {
  const reduceMotion = useReducedMotion()

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      delay: Math.random() * 4,
      duration: 6 + Math.random() * 8,
    }))
  }, [count])

  if (reduceMotion) return null

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-white/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            boxShadow: "0 0 12px rgba(236, 72, 153, 0.35)",
          }}
          animate={{
            y: [0, -30, -60],
            opacity: [0, 0.7, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}
