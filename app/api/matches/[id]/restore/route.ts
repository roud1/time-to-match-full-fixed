/** Thin Next.js entry — logic in @/api/handlers */

export const runtime = "nodejs"

export { OPTIONS, postRestore as POST } from "@/api/handlers/matches/restore/handler"
