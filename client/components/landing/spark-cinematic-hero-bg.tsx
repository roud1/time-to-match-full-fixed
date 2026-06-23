"use client"

import { SparkCinematicAtmosphere } from "@/client/components/background/spark-cinematic-atmosphere"

/** @deprecated Hero uses global SiteBackground; kept for optional local parallax overlay. */
export function SparkCinematicHeroBg() {
  return <SparkCinematicAtmosphere parallax />
}
