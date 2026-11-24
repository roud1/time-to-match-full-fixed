import { jsonOk } from "@/server/http"
import { checkEligibility, getRoomForUser, queueStatus } from "@/server/blind-date/service"
import { freeDailyDates } from "@/server/blind-date/rules"
import { cors, guard, internalError, options } from "./shared"

export { options as OPTIONS }

/** GET /api/blind-date/state — queue / open room (used for reconnection) and eligibility. */
export async function GET(request: Request) {
  const g = await guard(request, { name: "state", max: 120, windowMs: 60_000 })
  if (!g.ok) return g.response
  try {
    let status = await queueStatus(g.userId)
    if (status.state === "in_room") {
      // Bring the room up to date; it may have closed while the user was away.
      const room = await getRoomForUser(status.roomId, g.userId)
      if (!room || room.status === "closed") status = await queueStatus(g.userId)
    }
    const eligibility = await checkEligibility(g.userId)
    return cors(
      request,
      jsonOk({
        ...status,
        eligible: eligibility.ok,
        reason: eligibility.ok ? null : eligibility.code,
        freeDailyDates: freeDailyDates(),
      })
    )
  } catch (err) {
    return internalError(request, "state", err)
  }
}
