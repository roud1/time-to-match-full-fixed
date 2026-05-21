"use client"

import type { ReactNode } from "react"
import type { EmotionalReality } from "@/lib/reality"
import { ConnectionEnergyField } from "@/components/reality/connection-energy-field"
import { CinematicMomentOverlay } from "@/components/reality/cinematic-moment-overlay"
import { RealityPresenceLine } from "@/components/reality/reality-presence-line"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type RelationshipRealitySpaceProps = {
  reality: EmotionalReality | null
  children: ReactNode
  surge?: boolean
  className?: string
}

/** Immersive per-connection world inside shared sync space. */
export function RelationshipRealitySpace({
  reality,
  children,
  surge,
  className,
}: RelationshipRealitySpaceProps) {
  const { t } = useI18n()

  return (
    <div
      className={cn("p16-reality-space flex flex-col flex-1 min-h-0", className)}
      style={reality ? (reality.style as React.CSSProperties) : undefined}
      {...(reality?.attrs ?? {})}
    >
      {reality && (
        <>
          <div className="p16-reality-space__horizon" aria-hidden />
          <div className="p16-reality-space__veil" aria-hidden />
          <div className="p16-reality-space__depth-blur" aria-hidden />
          <ConnectionEnergyField energy={reality.energy} surge={surge} />
          <CinematicMomentOverlay cinematic={reality.cinematic} />
          <p className="p16-reality-space__env-label" aria-hidden>
            {t(reality.environment.labelKey)}
          </p>
        </>
      )}
      <div className="p16-reality-space__content flex flex-col flex-1 min-h-0">
        {reality?.presence && <RealityPresenceLine line={reality.presence} className="shrink-0" />}
        {children}
      </div>
    </div>
  )
}
