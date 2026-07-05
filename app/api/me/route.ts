/** Thin Next.js entry — logic in @/api/handlers */

export const runtime = "nodejs"

export { OPTIONS, GET } from "@/api/handlers/me/handler"
export { DELETE } from "@/api/handlers/me/delete-handler"
