"use client"

import { useEffect } from "react"
import { getActiveConnections, getConnection } from "@/lib/connection-store"
import { buildConnectionView } from "@/lib/connection-system"
import { extractSignals, analyzeConnection } from "@/lib/connection-engine"
import { getChatMessagesForProfile } from "@/lib/social-store"
import { analyzeRelationshipEcology } from "@/lib/ecosystem"
import { getRelationshipIdentity } from "@/lib/relationship-identity"
import { detectEvolutionEvents, persistEvolutionEvents } from "@/lib/network"
import { runConnectionTicks } from "@/lib/connection-store"

/** Scans active connections for rare evolution events. */
export function useEvolutionEventScanner(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const scan = () => {
      runConnectionTicks()
      for (const record of getActiveConnections()) {
        const full = getConnection(record.profileId) ?? record
        const view = buildConnectionView(full)
        const messages = getChatMessagesForProfile(full.profileId)
        const signals = extractSignals(messages, full)
        const analysis = analyzeConnection(view, messages, full)
        const identity = getRelationshipIdentity(full.profileId)
        const ecology = analyzeRelationshipEcology(
          view,
          analysis,
          messages,
          full,
          identity?.evolutionStage ?? "forming"
        )
        const detected = detectEvolutionEvents(full.profileId, view, analysis, ecology)
        if (detected.length > 0) persistEvolutionEvents(detected)
      }
    }

    scan()
    const interval = window.setInterval(scan, 8000)
    window.addEventListener("ttm-connection-updated", scan)
    window.addEventListener("ttm-social-updated", scan)
    return () => {
      clearInterval(interval)
      window.removeEventListener("ttm-connection-updated", scan)
      window.removeEventListener("ttm-social-updated", scan)
    }
  }, [enabled])
}
