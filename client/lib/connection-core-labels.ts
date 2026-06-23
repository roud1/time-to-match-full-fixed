import type { BondLevel, ChemistryLevel } from "@/client/lib/connection-engine"
import type { TranslationKey } from "@/client/lib/i18n"

const CHEMISTRY_KEY: Record<ChemistryLevel, TranslationKey> = {
  low: "chemistryLow",
  medium: "chemistryMedium",
  high: "chemistryHigh",
  peak: "chemistryPeak",
}

const BOND_KEY: Record<BondLevel, TranslationKey> = {
  forming: "bondForming",
  growing: "bondGrowing",
  stable: "bondStableLabel",
  deep: "bondDeep",
}

export function getChemistryLabel(
  level: ChemistryLevel,
  t: (key: TranslationKey) => string
): string {
  return t(CHEMISTRY_KEY[level])
}

export function getBondLabel(level: BondLevel, t: (key: TranslationKey) => string): string {
  return t(BOND_KEY[level])
}

export function getEnergyLabel(percent: number, t: (key: TranslationKey) => string): string {
  if (percent >= 70) return t("energyHigh")
  if (percent >= 40) return t("energySteady")
  return t("energyCooling")
}
