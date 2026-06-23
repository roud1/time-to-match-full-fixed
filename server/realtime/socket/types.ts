/** Socket.io event contracts for match chat rooms (`match:{matchId}`). */

export type SocketMatchMessage = {
  id: string
  matchId: string
  senderId: string
  body: string
  createdAt: string
}

export type SocketMessageAck =
  | {
      ok: true
      message: SocketMatchMessage
      bond?: {
        prolonged: boolean
        newExpiresAt?: string
        bondLevel: number
        totalMessages: number
        bondProgress: number
        prolongCount: number
        messagesUntilNext: number
        addedHours?: number
        systemMessage?: string
      }
      gamification?: unknown
    }
  | { ok: false; code: string; message?: string }

export type ClientToServerEvents = {
  "join:match": (payload: { matchId: string }) => void
  "message:send": (
    payload: { matchId: string; text: string },
    ack?: (result: SocketMessageAck) => void
  ) => void
  "typing:start": (payload: { matchId: string }) => void
  "typing:stop": (payload: { matchId: string }) => void
}

export type ServerToClientEvents = {
  "message:new": (payload: { message: SocketMatchMessage }) => void
  "typing:start": (payload: { matchId: string; userId: string }) => void
  "typing:stop": (payload: { matchId: string; userId: string }) => void
  "presence:online": (payload: { matchId: string; userId: string }) => void
  "presence:offline": (payload: { matchId: string; userId: string }) => void
}

export type SocketData = {
  userId: string
  email: string
  matchRooms: Set<string>
}

export function matchRoomName(matchId: string): string {
  return `match:${matchId}`
}
