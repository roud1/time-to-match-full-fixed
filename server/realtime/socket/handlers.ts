import type { Server, Socket } from "socket.io"
import { getMatchForUser } from "@/server/match-engine/repository"
import { authenticateSocket, attachSocketUser } from "@/server/realtime/socket/auth"
import {
  clearUserTyping,
  heartbeatPresence,
  setUserTyping,
} from "@/server/realtime/ephemeral"
import { persistMatchMessageViaSocket } from "@/server/realtime/socket/message-persist"
import {
  matchRoomName,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type SocketData,
} from "@/server/realtime/socket/types"

async function verifyMatchAccess(matchId: string, userId: string) {
  if (!matchId || matchId.startsWith("local:")) return null
  return getMatchForUser(matchId, userId)
}

function userRooms(socket: Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>) {
  const data = socket.data as SocketData
  if (!data.matchRooms) data.matchRooms = new Set()
  return data.matchRooms
}

function broadcastPresence(
  io: Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>,
  matchId: string,
  userId: string,
  online: boolean
) {
  const event = online ? "presence:online" : "presence:offline"
  io.to(matchRoomName(matchId)).emit(event, { matchId, userId })
}

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>
) {
  io.use(async (socket, next) => {
    const claims = await authenticateSocket(socket)
    if (!claims) {
      next(new Error("unauthorized"))
      return
    }
    attachSocketUser(socket, claims)
    next()
  })

  io.on("connection", (socket) => {
    const userId = (socket.data as SocketData).userId
    void heartbeatPresence(userId)

    socket.on("join:match", async ({ matchId }) => {
      const ctx = await verifyMatchAccess(matchId, userId)
      if (!ctx) return

      const room = matchRoomName(matchId)
      await socket.join(room)
      userRooms(socket).add(matchId)

      broadcastPresence(io, matchId, userId, true)
    })

    socket.on("message:send", async ({ matchId, text }, ack) => {
      const ctx = await verifyMatchAccess(matchId, userId)
      if (!ctx) {
        ack?.({ ok: false, code: "forbidden", message: "Not a match participant" })
        return
      }

      const result = await persistMatchMessageViaSocket({ matchId, senderId: userId, text })
      if (!result.ok) {
        ack?.(result)
        return
      }

      io.to(matchRoomName(matchId)).emit("message:new", { message: result.message })
      ack?.(result)
    })

    socket.on("typing:start", async ({ matchId }) => {
      const ctx = await verifyMatchAccess(matchId, userId)
      if (!ctx) return

      await setUserTyping(matchId, userId)
      socket.to(matchRoomName(matchId)).emit("typing:start", { matchId, userId })
    })

    socket.on("typing:stop", async ({ matchId }) => {
      const ctx = await verifyMatchAccess(matchId, userId)
      if (!ctx) return

      await clearUserTyping(matchId, userId)
      socket.to(matchRoomName(matchId)).emit("typing:stop", { matchId, userId })
    })

    socket.on("disconnect", () => {
      const rooms = userRooms(socket)
      for (const matchId of rooms) {
        broadcastPresence(io, matchId, userId, false)
      }
      rooms.clear()
    })
  })
}
