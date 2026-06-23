"use client"

import type { ReactNode } from "react"
import type { RelationshipEcology } from "@/client/lib/ecosystem"
import { STAGE_DESC_KEYS } from "@/client/lib/ecosystem"
import { useI18n } from "@/client/lib/i18n"
import { RelationshipStageRibbon } from "@/client/components/ecosystem/relationship-stage-ribbon"
import { cn } from "@/client/lib/utils"

type SharedSyncSpaceProps = {
  ecology: RelationshipEcology | null
  stageProgress: number
  /** SYNC panel, ecology strip, insights — left rail on md+ */
  sidebar?: ReactNode
  children: ReactNode
  className?: string
}

function ecologyVisualVars(ecology: RelationshipEcology): React.CSSProperties {
  const { level, glowMul, particleMul } = ecology.atmosphere
  return {
    ["--eco-depth-opacity" as string]: String(level * glowMul * 0.55),
    ["--eco-wave-opacity" as string]: String(0.12 + level * 0.35),
    ["--eco-particle-opacity" as string]: String(0.2 + particleMul * 0.5),
    ["--eco-chat-glow" as string]: String(Math.min(1, level * 1.15)),
    ["--eco-atmosphere-level" as string]: String(level),
    ["--eco-glow-mul" as string]: String(glowMul),
    ["--eco-particle-mul" as string]: String(particleMul),
    ["--eco-motion-scale" as string]: String(ecology.atmosphere.motionScale),
  }
}

export function SharedSyncSpace({
  ecology,
  stageProgress,
  sidebar,
  children,
  className,
}: SharedSyncSpaceProps) {
  const { t } = useI18n()
  const waveStyle = ecology ? { animationDuration: `${18 / Math.max(ecology.atmosphere.waveSpeed, 0.3)}s` } : undefined

  return (
    <div
      className={cn("eco-sync-space flex flex-col flex-1 min-h-0", className)}
      style={ecology ? ecologyVisualVars(ecology) : undefined}
      data-eco-stage={ecology?.stage}
    >
      <div className="eco-sync-space__depth" aria-hidden>
        <div className="eco-sync-space__depth-blur" />
        <div className="eco-sync-space__wave" style={waveStyle} />
      </div>

      <div
        className={cn(
          "eco-sync-space__content",
          sidebar ? "eco-sync-space__content--split" : null
        )}
      >
        {sidebar ? (
          <>
            <div className="eco-sync-space__rail">
              <header className="eco-space-header shrink-0">
                <p className="eco-space-header__eyebrow">{t("ecoSharedSpaceEyebrow")}</p>
              </header>

              {ecology && (
                <RelationshipStageRibbon
                  stage={ecology.stage}
                  progress={stageProgress}
                  description={t(STAGE_DESC_KEYS[ecology.stage])}
                />
              )}

              {sidebar}
            </div>
            <div className="eco-sync-space__chat">{children}</div>
          </>
        ) : (
          <>
            <header className="eco-space-header shrink-0">
              <p className="eco-space-header__eyebrow">{t("ecoSharedSpaceEyebrow")}</p>
            </header>

            {ecology && (
              <RelationshipStageRibbon
                stage={ecology.stage}
                progress={stageProgress}
                description={t(STAGE_DESC_KEYS[ecology.stage])}
              />
            )}

            {children}
          </>
        )}
      </div>
    </div>
  )
}
