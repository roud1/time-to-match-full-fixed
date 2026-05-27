import type { Icebreaker } from "@/lib/icebreakers/types"
import { FALLBACK_ICEBREAKERS, pickRandomIcebreakers } from "@/lib/icebreakers/fallback"

export async function fetchIcebreakers(): Promise<Icebreaker[]> {
  try {
    const res = await fetch("/api/icebreakers", { credentials: "include" })
    if (!res.ok) return FALLBACK_ICEBREAKERS
    const data = (await res.json()) as { icebreakers?: Icebreaker[] }
    const list = data.icebreakers ?? []
    return list.length > 0 ? list : FALLBACK_ICEBREAKERS
  } catch {
    return FALLBACK_ICEBREAKERS
  }
}

export async function fetchRandomIcebreakers(count = 3): Promise<Icebreaker[]> {
  try {
    const res = await fetch(`/api/icebreakers/random?count=${count}`, { credentials: "include" })
    if (!res.ok) return pickRandomIcebreakers(FALLBACK_ICEBREAKERS, count)
    const data = (await res.json()) as { icebreakers?: Icebreaker[] }
    const list = data.icebreakers ?? []
    if (list.length > 0) return list
    return pickRandomIcebreakers(FALLBACK_ICEBREAKERS, count)
  } catch {
    return pickRandomIcebreakers(FALLBACK_ICEBREAKERS, count)
  }
}
