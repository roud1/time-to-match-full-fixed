import type { TranslationKey } from "@/client/lib/i18n"

export type SyncCopyKeys = {
  syncLabel: string
  connectionLabel: string
  chemistryLabel: string
  energyLabel: string
  bondLabel: string
  timelineTitle: string
  interactionHint: string
  syncStatusGrowing: string
  syncStatusStable: string
  syncStatusWaiting: string
  syncStatusFading: string
  syncStatusActive: string
  syncStatusSynced: string
}

export function buildSyncCopy(t: (key: TranslationKey) => string): SyncCopyKeys {
  return {
    syncLabel: t("syncLabel"),
    connectionLabel: t("syncConnectionLabel"),
    chemistryLabel: t("syncChemistryLabel"),
    energyLabel: t("syncEnergyLabel"),
    bondLabel: t("bondLabel"),
    timelineTitle: t("syncTimelineTitle"),
    interactionHint: t("syncInteractionHint"),
    syncStatusGrowing: t("syncStatusGrowing"),
    syncStatusStable: t("syncStatusStable"),
    syncStatusWaiting: t("syncStatusWaiting"),
    syncStatusFading: t("syncStatusFading"),
    syncStatusActive: t("syncStatusActive"),
    syncStatusSynced: t("syncStatusSynced"),
  }
}
