/** Thin Next.js entry — logic in @/api/handlers */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export { getPhoto as GET } from "@/api/handlers/photos/handler"
