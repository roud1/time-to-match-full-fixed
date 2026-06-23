import type { ConnectionCopyKeys } from "@/client/lib/connection-system"
import type { TranslationKey } from "@/client/lib/i18n"

export function buildConnectionCopy(t: (key: TranslationKey) => string): ConnectionCopyKeys & {
  timerTogether: string
  stableLabel: string
  reconnect: string
  waitingReply: string
} {
  return {
    stageSpark: t("connectionStageSpark"),
    stageActive: t("connectionStageActive"),
    stageStrong: t("connectionStageStrong"),
    stageRare: t("connectionStageRare"),
    stageStable: t("connectionStageStable"),
    streakStill: t("connectionStreakStill"),
    streakChoosing: t("connectionStreakChoosing"),
    streakIncreased: t("connectionStreakIncreased"),
    fading: t("connectionFading"),
    fadingLong: t("connectionFadingLong"),
    extended: t("connectionExtended"),
    togetherHours: t("connectionTimerTogether"),
    memoryDays: t("connectionMemoryDays"),
    memoryFaded: t("connectionMemoryFaded"),
    timerTogether: t("connectionTimerTogether"),
    stableLabel: t("connectionStable"),
    reconnect: t("chatReconnectHint"),
    waitingReply: t("syncStatusWaiting"),
  }
}
