"use client"

import { useReducedMotion } from "motion/react"
import { CinematicParticles } from "@/client/components/ui/cinematic-particles"

export function LandingAmbient() {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="landing-ambient" aria-hidden>
      <div className="landing-ambient__layer">
        <div className="landing-ambient__blob landing-ambient__blob--1" />
        <div className="landing-ambient__blob landing-ambient__blob--2" />
        <div className="landing-ambient__blob landing-ambient__blob--3" />
        <div className="landing-ambient__grid" />
      </div>
      <CinematicParticles count={12} className="opacity-40" />
    </div>
  )
}
