"use client"

import { Heart } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { useScrollParallaxY } from "@/hooks/use-parallax"
import { cn } from "@/lib/utils"

const HEARTS = [
  { left: "8%", top: "18%", size: 14, delay: "0s", opacity: 0.35, depth: 0.35 },
  { left: "88%", top: "22%", size: 18, delay: "-1.5s", opacity: 0.45, depth: 0.55 },
  { left: "72%", top: "68%", size: 12, delay: "-3s", opacity: 0.3, depth: 0.25 },
  { left: "14%", top: "72%", size: 16, delay: "-4.5s", opacity: 0.4, depth: 0.45 },
  { left: "48%", top: "12%", size: 10, delay: "-2s", opacity: 0.25, depth: 0.2 },
  { left: "92%", top: "58%", size: 13, delay: "-5s", opacity: 0.32, depth: 0.38 },
] as const

function HeartParallax({
  heart,
  reduce,
}: {
  heart: (typeof HEARTS)[number]
  reduce: boolean | null
}) {
  const y = useScrollParallaxY({
    input: [0, 500],
    output: [0, 40 + heart.depth * 50],
  })

  return (
    <DatingParallaxLayer
      y={y}
      className={cn("ttm-dating-hero__heart", !reduce && "ttm-dating-hero__heart--float")}
      style={{
        left: heart.left,
        top: heart.top,
        animationDelay: heart.delay,
        opacity: heart.opacity,
      }}
    >
      <Heart size={heart.size} fill="currentColor" aria-hidden />
    </DatingParallaxLayer>
  )
}

export function DatingHeroAtmosphere() {
  const reduce = useReducedMotion()
  const meshY = useScrollParallaxY({ input: [0, 700], output: [0, 120] })
  const roseGlowY = useScrollParallaxY({ input: [0, 700], output: [0, 80] })
  const amberGlowY = useScrollParallaxY({ input: [0, 700], output: [0, 55] })
  const pulseY = useScrollParallaxY({ input: [0, 500], output: [0, -30] })

  return (
    <div className="ttm-dating-hero__atmosphere" aria-hidden>
      <DatingParallaxLayer y={meshY} className="ttm-dating-hero__mesh" />
      <DatingParallaxLayer
        y={roseGlowY}
        className="ttm-dating-hero__glow ttm-dating-hero__glow--rose"
      />
      <DatingParallaxLayer
        y={amberGlowY}
        className="ttm-dating-hero__glow ttm-dating-hero__glow--amber"
      />
      <div className="ttm-dating-hero__vignette" />

      <DatingParallaxLayer
        y={pulseY}
        className={cn("ttm-dating-hero__match-pulse", !reduce && "ttm-dating-hero__match-pulse--live")}
      >
        <span className="ttm-dating-hero__match-pulse-ring" />
        <span className="ttm-dating-hero__match-pulse-core">
          <Heart size={18} fill="currentColor" aria-hidden />
        </span>
      </DatingParallaxLayer>

      <div className="ttm-dating-hero__hearts">
        {HEARTS.map((heart, index) => (
          <HeartParallax key={index} heart={heart} reduce={reduce} />
        ))}
      </div>
    </div>
  )
}
