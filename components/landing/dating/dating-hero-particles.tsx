"use client"

import { useEffect, useMemo, useState } from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const DESKTOP_COUNT = 42
const MOBILE_COUNT = 14
const BOKEH_COUNT = 8

function seededRandom(seed: number) {
  const x = Math.sin(seed * 7841) * 10000
  return x - Math.floor(x)
}

function fixed(value: number, digits = 4) {
  return value.toFixed(digits)
}

export function DatingHeroParticles() {
  const reduce = useReducedMotion()
  const [count, setCount] = useState(DESKTOP_COUNT)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setCount(mq.matches ? MOBILE_COUNT : DESKTOP_COUNT)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${fixed(seededRandom(i + 11) * 100, 4)}%`,
        top: `${fixed(seededRandom(i + 22) * 100, 4)}%`,
        size: `${fixed(1.5 + seededRandom(i + 33) * 2.5, 4)}px`,
        delay: `${fixed(seededRandom(i + 44) * -18, 4)}s`,
        duration: `${fixed(10 + seededRandom(i + 55) * 14, 4)}s`,
        opacity: fixed(0.15 + seededRandom(i + 66) * 0.45, 6),
        bokeh: i < BOKEH_COUNT,
      })),
    [count]
  )

  if (reduce) return null

  return (
    <div className="ttm-dating-hero__particles" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className={cn(
            "ttm-dating-hero__particle",
            p.bokeh && "ttm-dating-hero__particle--bokeh"
          )}
          style={{
            left: p.left,
            top: p.top,
            width: p.bokeh
              ? `${fixed(48 + seededRandom(p.id + 77) * 80, 4)}px`
              : p.size,
            height: p.bokeh
              ? `${fixed(48 + seededRandom(p.id + 77) * 80, 4)}px`
              : p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.bokeh ? fixed(0.06 + seededRandom(p.id + 88) * 0.12, 6) : p.opacity,
          }}
        />
      ))}
    </div>
  )
}
