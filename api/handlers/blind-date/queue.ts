import { z } from "zod"
import { jsonError, jsonOk } from "@/server/http"
import { checkEligibility, findOpenRoomId, joinOrPoll, leaveQueue } from "@/server/blind-date/service"
import { SUPPORTED_LANGS, cors, guard, internalError, options, readJson } from "./shared"

export { options as OPTIONS }

const lang = z.enum(SUPPORTED_LANGS)
const bodySchema = z.object({
  lang: lang.default("en"),
  languages: z.array(lang).max(9).default([]),
})

/**
 * POST /api/blind-date/queue — join the queue, or refresh the entry while waiting (the client
 * calls it every few seconds). Pairs immediately when a compatible person is waiting.
 */
export async function POST(request: Request) {
  const g = await guard(request, { name: "queue", max: 60, windowMs: 60_000 })
  if (!g.ok) return g.response
  const parsed = bodySchema.safeParse(await readJson(request))
  if (!parsed.success) return cors(request, jsonError(400, { error: "validation_error" }))
  try {
    const open = await findOpenRoomId(g.userId)
    if (open) return cors(request, jsonOk({ state: "matched", roomId: open }))

    const eligibility = await checkEligibility(g.userId)
    if (!eligibility.ok) return cors(request, jsonError(403, { error: eligibility.code }))

    const languages = Array.from(new Set([parsed.data.lang, ...parsed.data.languages]))
    const result = await joinOrPoll(g.userId, { lang: parsed.data.lang, languages })
    return cors(request, jsonOk(result))
  } catch (err) {
    return internalError(request, "queue", err)
  }
}

/** DELETE /api/blind-date/queue — stop searching. */
export async function DELETE(request: Request) {
  const g = await guard(request, { name: "queue-leave", max: 60, windowMs: 60_000 })
  if (!g.ok) return g.response
  try {
    await leaveQueue(g.userId)
    return cors(request, jsonOk({ state: "idle" }))
  } catch (err) {
    return internalError(request, "queue-leave", err)
  }
}
