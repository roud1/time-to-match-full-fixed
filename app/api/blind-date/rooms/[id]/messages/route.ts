/** Thin Next.js entry — logic in @/api/handlers */

export const runtime = "nodejs"

export { OPTIONS, postRoomMessage as POST } from "@/api/handlers/blind-date/room"
