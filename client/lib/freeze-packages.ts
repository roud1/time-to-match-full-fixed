export type FreezePackageId = "small" | "medium" | "large"

export type FreezePackage = {
  id: FreezePackageId
  count: number
  nameKey: "freezePackSmall" | "freezePackMedium" | "freezePackLarge"
}

// No payment provider is wired for packs yet: no prices here (see api/handlers/purchases/buy-freezes).
export const FREEZE_PACKAGES: FreezePackage[] = [
  { id: "small", count: 3, nameKey: "freezePackSmall" },
  { id: "medium", count: 10, nameKey: "freezePackMedium" },
  { id: "large", count: 30, nameKey: "freezePackLarge" },
]

export function getFreezePackage(id: FreezePackageId): FreezePackage | undefined {
  return FREEZE_PACKAGES.find((p) => p.id === id)
}
