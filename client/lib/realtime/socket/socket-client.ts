"use client"

import { io, type Socket } from "socket.io-client"
import type { ClientToServerEvents, ServerToClientEvents } from "@/client/lib/realtime/socket/types"

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: SocketClient | null = null
let socketToken: string | null = null
let tokenFetchedAt = 0
const TOKEN_TTL_MS = 4 * 60 * 1000

export function isSocketConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SOCKET_URL?.trim())
}

export function getSocketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL?.trim() || "http://localhost:3001"
}

async function fetchSocketToken(): Promise<string | null> {
  const now = Date.now()
  if (socketToken && now - tokenFetchedAt < TOKEN_TTL_MS) return socketToken

  try {
    const res = await fetch("/api/realtime/socket-token", { credentials: "include" })
    if (!res.ok) return null
    const data = (await res.json()) as { token?: string }
    if (!data.token) return null
    socketToken = data.token
    tokenFetchedAt = now
    return data.token
  } catch {
    return null
  }
}

function needsCrossOriginToken(): boolean {
  if (typeof window === "undefined") return false
  try {
    const socketOrigin = new URL(getSocketUrl()).origin
    return socketOrigin !== window.location.origin
  } catch {
    return false
  }
}

/** Singleton Socket.io connection (lazy, reconnects automatically). */
export async function getSocketClient(): Promise<SocketClient | null> {
  if (!isSocketConfigured()) return null
  if (socket?.connected) return socket

  const auth: { token?: string } = {}
  if (needsCrossOriginToken()) {
    const token = await fetchSocketToken()
    if (token) auth.token = token
  }

  if (!socket) {
    socket = io(getSocketUrl(), {
      path: "/socket.io",
      withCredentials: true,
      auth,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })
  } else if (auth.token) {
    socket.auth = auth
  }

  if (!socket.connected) {
    socket.connect()
  }

  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
  socketToken = null
  tokenFetchedAt = 0
}

export function getSocketConnectionState(): "connected" | "connecting" | "disconnected" {
  if (!socket) return "disconnected"
  if (socket.connected) return "connected"
  if (socket.active) return "connecting"
  return "disconnected"
}
