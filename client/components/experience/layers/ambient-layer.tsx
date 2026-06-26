"use client"

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react"
import { useRef } from "react"
import { useHeroParallax } from "@/client/hooks/use-hero-parallax"
import { useHydrated } from "@/client/hooks/use-hydrated"
import { useScrollParallaxY } from "@/client/hooks/use-parallax"
import { ParallaxLayer } from "@/client/components/experience/primitives/parallax-layer"
import { cn } from "@/client/lib/utils"

const ORBS = [
  {
    id: "purple",
    className: "xp-ambient__orb xp-ambient__orb--purple xp-ambient__orb--1",
    output: [0, 140] as [number, number],
    delay: "0s",
  },
  {
    id: "pink",
    className: "xp-ambient__orb xp-ambient__orb--pink xp-ambient__orb--2",
    output: [0, -100] as [number, number],
    delay: "-2.4s",
  },
  {
    id: "green",
    className: "xp-ambient__orb xp-ambient__orb--green xp-ambient__orb--3",
    output: [0, 80] as [number, number],
    delay: "-4.8s",
  },
  {
    id: "violet",
    className: "xp-ambient__orb xp-ambient__orb--violet xp-ambient__orb--4",
    output: [0, -60] as [number, number],
    delay: "-1.6s",
  },
  {
    id: "mint",
    className: "xp-ambient__orb xp-ambient__orb--mint xp-ambient__orb--5",
    output: [0, 110] as [number, number],
    delay: "-3.2s",
  },
] as const

function AmbientOrb({
  className,
  output,
  delay,
  reduce,
  scrollY,
}: {
  className: string
  output: [number, number]
  delay: string
  reduce: boolean | null
  scrollY: MotionValue<number>
}) {
  const y = useScrollParallaxY({ input: [0, 1200], output, scrollY })

  return (
    <ParallaxLayer y={y}>
      <div
        className={cn(className, !reduce && "xp-ambient__orb--live")}
        style={{ animationDelay: delay }}
      />
    </ParallaxLayer>
  )
}

export function AmbientLayer() {
  const reduce = useReducedMotion()
  const hydrated = useHydrated()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const meshY = useScrollParallaxY({ input: [0, 1000], output: [0, 90], scrollY })
  const auroraY = useScrollParallaxY({ input: [0, 900], output: [0, 70], scrollY })
  const raysRotate = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 8])
  const { x: spotX, y: spotY } = useHeroParallax(24)

  return (
    <div ref={ref} className="xp-ambient pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="xp-ambient__base" />

      <ParallaxLayer y={meshY}>
        <div className={cn("xp-ambient__mesh", !reduce && "xp-ambient__mesh--live")} />
      </ParallaxLayer>

      <ParallaxLayer y={auroraY}>
        <div className={cn("xp-ambient__aurora", !reduce && "xp-ambient__aurora--live")} />
      </ParallaxLayer>

      <div className={cn("xp-ambient__aurora-band", !reduce && "xp-ambient__aurora-band--live")} />

      <div className="xp-ambient__orbs">
        {ORBS.map((orb) => (
          <AmbientOrb
            key={orb.id}
            className={orb.className}
            output={orb.output}
            delay={orb.delay}
            reduce={reduce}
            scrollY={scrollY}
          />
        ))}
      </div>

      <div className={cn("xp-ambient__stars", !reduce && "xp-ambient__stars--live")} />
      <div className={cn("xp-ambient__stars xp-ambient__stars--far", !reduce && "xp-ambient__stars--live")} />

      <ParallaxLayer style={{ rotate: raysRotate }}>
        <div className={cn("xp-ambient__rays", !reduce && "xp-ambient__rays--live")} />
      </ParallaxLayer>

      {hydrated && !reduce ? (
        <motion.div
          className="xp-ambient__spotlight hidden md:block"
          style={{ x: spotX, y: spotY }}
        />
      ) : null}

      <div
        className="xp-ambient__grid opacity-[0.04]"
        style={{
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)",
        }}
      />

      <div className="xp-ambient__vignette" />
      <div className="xp-ambient__grain" />
    </div>
  )
}
