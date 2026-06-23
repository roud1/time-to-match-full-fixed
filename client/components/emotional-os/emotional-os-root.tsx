"use client"

import type { ReactNode } from "react"
import { useEmotionalConsciousness } from "@/client/hooks/use-emotional-consciousness"
import { SilenceField } from "@/client/components/emotional-consciousness/silence-field"
import { TensionVeil } from "@/client/components/emotional-consciousness/tension-veil"
import { ConsciousnessAtmosphereVeil } from "@/client/components/emotional-consciousness/consciousness-atmosphere-veil"
import { DigitalRealismVeil } from "@/client/components/emotional-consciousness/digital-realism-veil"
import { MemoryEchoLayer } from "@/client/components/emotional-consciousness/memory-echo-layer"
import { WeatherLayer } from "@/client/components/reality-expansion/weather-layer"
import { CinematicStateVeil } from "@/client/components/reality-expansion/cinematic-state-veil"
import { PlatformSoulField } from "@/client/components/reality-expansion/platform-soul-field"
import { LivingUiVeil } from "@/client/components/reality-expansion/living-ui-veil"
import { useGlobalAtmosphere } from "@/client/hooks/use-global-atmosphere"
import { LiveEmotionalField } from "@/client/components/world/live-emotional-field"
import { GlobalAtmosphereLayer } from "@/client/components/world/global-atmosphere-layer"
import { RealityWorldAmbient } from "@/client/components/reality/reality-world-ambient"
import { TimeFlowAmbient } from "@/client/components/time/time-flow-ambient"
import { AtmosphereNetworkLayer } from "@/client/components/emotional-os/atmosphere-network-layer"
import { OrchestratorVeil } from "@/client/components/emotional-os/orchestrator-veil"
import { ContinuityBreath } from "@/client/components/emotional-os/continuity-breath"
import type { Locale } from "@/client/lib/i18n"
import type { GeoPosition } from "@/client/lib/geo"
import { cn } from "@/client/lib/utils"

type EmotionalOsRootProps = {
  children: ReactNode
  className?: string
  ambient?: boolean
  locale?: Locale
  position?: GeoPosition | null
}

/**
 * Phase 20–22 — Emotional OS, Reality Expansion, Consciousness root.
 */
export function EmotionalOsRoot({
  children,
  className,
  ambient = true,
  locale,
  position,
}: EmotionalOsRootProps) {
  const { os, expansion, ...consciousness } = useEmotionalConsciousness({ locale, position })
  const { attrs: worldAttrs, style: worldStyle } = useGlobalAtmosphere()

  return (
    <div
      className={cn("eo-root er-reality-root ec-consciousness-root world-root relative", className)}
      {...os.attrs}
      {...expansion.attrs}
      {...consciousness.attrs}
      {...worldAttrs}
      style={
        {
          ...worldStyle,
          ...os.style,
          ...expansion.style,
          ...consciousness.style,
        } as React.CSSProperties
      }
    >
      {ambient && (
        <>
          <SilenceField silence={consciousness.silence} />
          <TensionVeil tension={consciousness.tension} />
          <ConsciousnessAtmosphereVeil atmosphere={consciousness.atmosphere} />
          <DigitalRealismVeil
            atmosphere={consciousness.atmosphere}
            silence={consciousness.silence}
          />
          <MemoryEchoLayer echoes={consciousness.echoes} />
          <WeatherLayer weather={expansion.weather} />
          <CinematicStateVeil cinematic={expansion.cinematic} />
          <LivingUiVeil atmosphere={expansion.atmosphere} />
          <PlatformSoulField soul={expansion.soul} className="er-soul-field--global" />
          <AtmosphereNetworkLayer network={os.network} />
          <OrchestratorVeil orchestration={os.orchestration} />
          <ContinuityBreath continuity={os.continuity} />
          <GlobalAtmosphereLayer />
          <RealityWorldAmbient />
          <TimeFlowAmbient />
          <LiveEmotionalField />
        </>
      )}
      <div className="eo-root__surface relative z-[1] flex flex-col flex-1 min-h-0 w-full">
        {children}
      </div>
    </div>
  )
}
