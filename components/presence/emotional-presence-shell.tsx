"use client"

import type { ReactNode } from "react"
import type { EmotionalPresenceSystem } from "@/lib/presence"
import { SharedPresenceField } from "@/components/presence/shared-presence-field"
import { ConnectionResonanceLayer } from "@/components/presence/connection-resonance-layer"
import { LateNightPresenceLayer } from "@/components/presence/late-night-presence-layer"
import { PresenceImmersiveField } from "@/components/presence/presence-immersive-field"
import { cn } from "@/lib/utils"

type EmotionalPresenceShellProps = {
  system: EmotionalPresenceSystem | null
  children: ReactNode
  className?: string
}

export function EmotionalPresenceShell({ system, children, className }: EmotionalPresenceShellProps) {
  return (
    <div
      className={cn("p18-presence-shell", system && "p18-presence-shell--live", className)}
      style={system ? (system.style as React.CSSProperties) : undefined}
      {...(system?.attrs ?? {})}
    >
      {system && (
        <>
          <PresenceImmersiveField resonance={system.resonance} lateNight={system.lateNight} />
          <LateNightPresenceLayer lateNight={system.lateNight} />
          <ConnectionResonanceLayer resonance={system.resonance} />
          <SharedPresenceField shared={system.shared} />
        </>
      )}
      <div className="p18-presence-shell__content">{children}</div>
    </div>
  )
}
