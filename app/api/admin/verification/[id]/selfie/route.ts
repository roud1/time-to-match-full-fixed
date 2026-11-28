/** Thin Next.js entry — logic in @/api/handlers */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export { getVerificationSelfie as GET } from "@/api/handlers/admin/verification/list/handler"
