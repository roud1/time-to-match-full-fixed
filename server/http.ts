import { NextResponse } from "next/server"
import { ZodError } from "zod"

export type ApiErrorBody = {
  error: string
  message?: string
  details?: unknown
  code?: string
  remaining?: number
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init })
}

export function jsonError(status: number, body: ApiErrorBody, init?: ResponseInit) {
  return NextResponse.json(body, { status, ...init })
}

export function jsonFromZodError(e: ZodError) {
  return jsonError(400, {
    error: "validation_error",
    message: "Invalid request body",
    details: e.flatten(),
  })
}

export function corsHeaders(request: Request): HeadersInit {
  const { CORS_ORIGINS } = process.env
  if (!CORS_ORIGINS) return {}
  const origin = request.headers.get("origin")
  if (!origin) return {}
  const allowed = CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  if (!allowed.includes(origin)) return {}
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

export function withCors(request: Request, res: NextResponse) {
  const h = corsHeaders(request)
  Object.entries(h).forEach(([k, v]) => res.headers.set(k, v))
  return res
}
