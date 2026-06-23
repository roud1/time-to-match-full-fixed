import type { Server as HttpServer } from "node:http"
import { Server } from "socket.io"
import { registerSocketHandlers } from "@/server/realtime/socket/handlers"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@/server/realtime/socket/types"

function socketCorsOrigins(): string[] | boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  const origins = new Set<string>(["http://localhost:3000", "http://127.0.0.1:3000"])
  if (appUrl) origins.add(appUrl)
  const extra = process.env.SOCKET_CORS_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean)
  if (extra?.length) extra.forEach((o) => origins.add(o))
  return [...origins]
}

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>(
    httpServer,
    {
      cors: {
        origin: socketCorsOrigins(),
        credentials: true,
      },
      path: "/socket.io",
    }
  )

  registerSocketHandlers(io)
  return io
}
