/** Thin Next.js entry — logic in @/api/handlers */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export { OPTIONS, getInsights as GET } from "@/api/handlers/blind-date/room"
