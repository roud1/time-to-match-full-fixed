"use client"

import { Heart } from "lucide-react"
import { useReducedMotion, useTransform, type MotionValue } from "motion/react"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { useScrollParallaxY } from "@/hooks/use-parallax"
import { cn } from "@/lib/utils"

const HEARTS = [
  { left: "12%", top: "20%", size: 12, delay: "0s", opacity: 0.22, depth: 0.3 },
  { left: "84%", top: "28%", size: 14, delay: "-2s", opacity: 0.28, depth: 0.45 },
  { left: "78%", top: "74%", size: 11, delay: "-4s", opacity: 0.18, depth: 0.25 },
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
    output: [0, 30 + heart.depth * 40],
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

type DatingHeroAtmosphereProps = {
  scrollProgress: MotionValue<number>
}

export function DatingHeroAtmosphere({ scrollProgress }: DatingHeroAtmosphereProps) {
  const reduce = useReducedMotion()
  const meshY = useScrollParallaxY({ input: [0, 700], output: [0, 80] })
  const auroraY = useScrollParallaxY({ input: [0, 600], output: [0, 60] })
  const roseGlowY = useScrollParallaxY({ input: [0, 700], output: [0, 55] })
  const amberGlowY = useScrollParallaxY({ input: [0, 700], output: [0, 40] })
  const auroraScale = useTransform(scrollProgress, [0, 0.6], [1, reduce ? 1 : 1.08])

  return (
    <div className="ttm-dating-hero__atmosphere" aria-hidden>
      <DatingParallaxLayer y={meshY} className="ttm-dating-hero__mesh" />
      <DatingParallaxLayer
        y={auroraY}
        className={cn("ttm-dating-hero__aurora", !reduce && "ttm-dating-hero__aurora--live")}
        style={{ scale: auroraScale }}
      />
      <DatingParallaxLayer
        y={roseGlowY}
        className="ttm-dating-hero__glow ttm-dating-hero__glow--rose"
      />
      <DatingParallaxLayer
        y={amberGlowY}
        className="ttm-dating-hero__glow ttm-dating-hero__glow--amber"
      />
      <div className="ttm-dating-hero__vignette" />

      <div className="ttm-dating-hero__hearts">
        {HEARTS.map((heart, index) => (
          <HeartParallax key={index} heart={heart} reduce={reduce} />
        ))}
      </div>
    </div>
  )
}
