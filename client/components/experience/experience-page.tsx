"use client"

import "./experience-tokens.css"
import { AmbientLayer } from "@/client/components/experience/layers/ambient-layer"
import { ExperienceFloatingChrome } from "@/client/components/experience/layers/floating-chrome"
import { ZoneConnector } from "@/client/components/experience/primitives/zone-connector"
import { ZoneHero } from "@/client/components/experience/zones/zone-hero"
import { ZoneImmersion } from "@/client/components/experience/zones/zone-immersion"
import { ZonePressure } from "@/client/components/experience/zones/zone-pressure"
import { ZoneMotion } from "@/client/components/experience/zones/zone-motion"
import { ZoneConnection } from "@/client/components/experience/zones/zone-connection"
import { ZoneProof } from "@/client/components/experience/zones/zone-proof"
import { ZoneCommit } from "@/client/components/experience/zones/zone-commit"
import { useI18n } from "@/client/lib/i18n"

export function ExperiencePage() {
  const { t } = useI18n()

  return (
    <main className="xp-root xp-page ttm-experience relative">
      <AmbientLayer />
      <ExperienceFloatingChrome />
      <div className="xp-grid">
        <ZoneHero />
        <ZoneConnector label={t("ttmXpFlowMatch")} />
        <ZoneImmersion />
        <ZoneConnector label={t("ttmXpFlowTimer")} />
        <ZonePressure />
        <ZoneConnector label={t("ttmXpFlowDecide")} />
        <ZoneMotion />
        <ZoneConnector label={t("ttmXpFlowConnect")} />
        <ZoneConnection />
        <ZoneConnector label={t("ttmXpFlowProof")} />
        <ZoneProof />
        <ZoneConnector label={t("ttmXpFlowJoin")} />
        <ZoneCommit />
      </div>
    </main>
  )
}
