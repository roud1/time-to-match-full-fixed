import { getDb } from "@/server/db"
import type { Icebreaker } from "@/client/lib/icebreakers/types"

type Row = { id: number; text: string; category: string }

function mapRow(row: Row): Icebreaker {
  return { id: row.id, text: row.text, category: row.category }
}

export async function listActiveIcebreakers(): Promise<Icebreaker[]> {
  const db = getDb()
  if (!db) return []
  const rows = await db<Row[]>`
    SELECT id, text, category
    FROM icebreakers
    WHERE is_active = true
    ORDER BY id ASC
  `
  return rows.map(mapRow)
}

export async function listRandomIcebreakers(count: number): Promise<Icebreaker[]> {
  const db = getDb()
  if (!db) return []
  const limit = Math.min(Math.max(count, 1), 20)
  const rows = await db<Row[]>`
    SELECT id, text, category
    FROM icebreakers
    WHERE is_active = true
    ORDER BY random()
    LIMIT ${limit}
  `
  return rows.map(mapRow)
}
