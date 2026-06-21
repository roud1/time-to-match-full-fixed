"use client"

import { useReducedMotion, useTransform, type MotionValue } from "motion/react"
import { DatingHeroParticles } from "@/components/landing/dating/dating-hero-particles"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { useScrollParallaxY } from "@/hooks/use-parallax"
import { cn } from "@/lib/utils"

type DatingHeroAtmosphereProps = {
  scrollProgress: MotionValue<number>
}

export function DatingHeroAtmosphere({ scrollProgress }: DatingHeroAtmosphereProps) {
  const reduce = useReducedMotion()
  const meshY = useScrollParallaxY({ input: [0, 700], output: [0, 80] })
  const auroraY = useScrollParallaxY({ input: [0, 600], output: [0, 60] })
  const roseGlowY = useScrollParallaxY({ input: [0, 700], output: [0, 55] })
  const amberGlowY = useScrollParallaxY({ input: [0, 700], output: [0, 40] })
  const auroraScale = useTransform(scrollProgress, [0, 0.6], [1, reduce ? 1 : 1.1])
  const meshRotate = useTransform(scrollProgress, [0, 1], [0, reduce ? 0 : 4])

  return (
    <div className="ttm-dating-hero__atmosphere" aria-hidden>
      <DatingParallaxLayer
        y={meshY}
        className={cn("ttm-dating-hero__mesh", !reduce && "ttm-dating-hero__mesh--live")}
        style={{ rotate: meshRotate }}
      />
      <DatingParallaxLayer
        y={auroraY}
        className={cn("ttm-dating-hero__aurora", !reduce && "ttm-dating-hero__aurora--live")}
        style={{ scale: auroraScale }}
      />
      <div className={cn("ttm-dating-hero__aurora-mesh", !reduce && "ttm-dating-hero__aurora-mesh--live")} />
      <DatingParallaxLayer
        y={roseGlowY}
        className="ttm-dating-hero__glow ttm-dating-hero__glow--rose"
      />
      <DatingParallaxLayer
        y={amberGlowY}
        className="ttm-dating-hero__glow ttm-dating-hero__glow--amber"
      />
      <div className="ttm-dating-hero__grain" />
      <div className="ttm-dating-hero__vignette" />
      <DatingHeroParticles />
    </div>
  )
}
