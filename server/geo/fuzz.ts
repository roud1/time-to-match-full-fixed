/**
 * Location privacy: other people never receive anyone's exact coordinates.
 *
 * A position is snapped to a ~2 km grid cell and moved to a fixed, per-user random point inside
 * that cell (stable, so repeated requests cannot be averaged back to the real spot). Distances
 * shown to others are computed from that point and rounded to whole kilometres, so they cannot
 * be used to trilaterate the real position either.
 */
import { createHash } from "node:crypto"
import { distanceKm } from "@/client/lib/geo"

/** Grid size in degrees of latitude (~2.2 km). */
const CELL_DEG = 0.02

function unitPair(seed: string): [number, number] {
  const h = createHash("sha256").update(`ttm-geo:${seed}`).digest()
  return [h.readUInt32BE(0) / 0xffffffff, h.readUInt32BE(4) / 0xffffffff]
}

export function approximatePosition(
  userId: string,
  lat: number | null | undefined,
  lng: number | null | undefined
): { lat: number; lng: number } | null {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return null
  const lngCell = CELL_DEG / Math.max(0.2, Math.cos((lat * Math.PI) / 180))
  const [u, v] = unitPair(userId)
  const cellLat = Math.floor(lat / CELL_DEG) * CELL_DEG
  const cellLng = Math.floor(lng / lngCell) * lngCell
  return {
    lat: Math.round((cellLat + u * CELL_DEG) * 1e4) / 1e4,
    lng: Math.round((cellLng + v * lngCell) * 1e4) / 1e4,
  }
}

/** Distance shown to another person: from the approximate point, whole km, at least 1. */
export function approximateDistanceKm(
  viewer: { lat: number; lng: number } | null,
  approx: { lat: number; lng: number } | null
): number | null {
  if (!viewer || !approx) return null
  return Math.max(1, Math.round(distanceKm(viewer, approx)))
}
