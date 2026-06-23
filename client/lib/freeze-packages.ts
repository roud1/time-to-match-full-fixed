export type FreezePackageId = "small" | "medium" | "large"

export type FreezePackage = {
  id: FreezePackageId
  count: number
  priceLabel: string
  nameKey: "freezePackSmall" | "freezePackMedium" | "freezePackLarge"
}

export const FREEZE_PACKAGES: FreezePackage[] = [
  { id: "small", count: 3, priceLabel: "$0.99", nameKey: "freezePackSmall" },
  { id: "medium", count: 10, priceLabel: "$2.99", nameKey: "freezePackMedium" },
  { id: "large", count: 30, priceLabel: "$4.99", nameKey: "freezePackLarge" },
]

export function getFreezePackage(id: FreezePackageId): FreezePackage | undefined {
  return FREEZE_PACKAGES.find((p) => p.id === id)
}
