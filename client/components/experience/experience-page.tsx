"use client"

import "./experience-tokens.css"
import { AmbientLayer } from "@/client/components/experience/layers/ambient-layer"
import { ExperienceFloatingChrome } from "@/client/components/experience/layers/floating-chrome"
import { ZoneImmersion } from "@/client/components/experience/zones/zone-immersion"
import { ZonePressure } from "@/client/components/experience/zones/zone-pressure"
import { ZoneMotion } from "@/client/components/experience/zones/zone-motion"
import { ZoneConnection } from "@/client/components/experience/zones/zone-connection"
import { ZoneProof } from "@/client/components/experience/zones/zone-proof"
import { ZoneCommit } from "@/client/components/experience/zones/zone-commit"

export function ExperiencePage() {
  return (
    <main className="xp-root xp-page ttm-experience relative">
      <AmbientLayer />
      <ExperienceFloatingChrome />
      <div className="xp-grid">
        <ZoneImmersion />
        <ZonePressure />
        <ZoneMotion />
        <ZoneConnection />
        <ZoneProof />
        <ZoneCommit />
      </div>
    </main>
  )
}
