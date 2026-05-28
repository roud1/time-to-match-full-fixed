"use client"

import { SparkCinematicAtmosphere } from "@/components/background/spark-cinematic-atmosphere"
import { SparkFloatingParticles } from "@/components/landing/spark-floating-particles"

/** Site-wide cinematic ambient — purple → pink → gold mesh, waves, vignette, sparks. */
export function SiteBackground() {
  return (
    <div className="site-bg-root fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <SparkCinematicAtmosphere />
      <SparkFloatingParticles />
    </div>
  )
}
