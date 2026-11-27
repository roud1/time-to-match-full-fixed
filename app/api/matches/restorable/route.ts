/** Thin Next.js entry — logic in @/api/handlers */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export { OPTIONS, listRestorable as GET } from "@/api/handlers/matches/restore/handler"
