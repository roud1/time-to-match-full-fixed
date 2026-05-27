import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { jsonOk, withCors } from "@/lib/server/http"
import { listActiveIcebreakers } from "@/lib/server/repositories/icebreakers"
import type { Icebreaker } from "@/lib/icebreakers/types"

export const runtime = "nodejs"

function groupByCategory(items: Icebreaker[]) {
  const byCategory: Record<string, Icebreaker[]> = {}
  for (const item of items) {
    const list = byCategory[item.category] ?? []
    list.push(item)
    byCategory[item.category] = list
  }
  return byCategory
}

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(request, jsonOk({ icebreakers: [], byCategory: {} }))
  }

  const icebreakers = await listActiveIcebreakers()
  return withCors(
    request,
    jsonOk({
      icebreakers,
      byCategory: groupByCategory(icebreakers),
    })
  )
}
