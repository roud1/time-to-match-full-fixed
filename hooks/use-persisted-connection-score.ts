"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { AIConnectionAnalysis } from "@/lib/ai-connection-engine/types"

export type PersistedConnectionScore = AIConnectionAnalysis & {
  id: string
  messageCount: number
}

type ConnectionScoreResponse = {
  configured: boolean
  analyzing: boolean
  score: PersistedConnectionScore | null
}

const POLL_MS = 2500
const POLL_FAST_MS = 1200

export function usePersistedConnectionScore(matchId: string | null | undefined) {
  const [score, setScore] = useState<PersistedConnectionScore | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(false)
  const fastPollUntil = useRef(0)

  const refresh = useCallback(async () => {
    if (!matchId || matchId.startsWith("local:")) {
      setScore(null)
      setAnalyzing(false)
      return null
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/matches/${encodeURIComponent(matchId)}/connection-score`, {
        credentials: "include",
      })
      if (!res.ok) return null
      const data = (await res.json()) as ConnectionScoreResponse
      setConfigured(data.configured)
      setAnalyzing(data.analyzing)
      setScore(data.score)
      if (data.analyzing) {
        fastPollUntil.current = Date.now() + 30_000
      }
      return data
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }, [matchId])

  useEffect(() => {
    if (!matchId || matchId.startsWith("local:")) {
      setScore(null)
      setAnalyzing(false)
      return
    }

    let cancelled = false
    let timer: number | undefined

    const schedule = () => {
      if (cancelled) return
      const ms = Date.now() < fastPollUntil.current ? POLL_FAST_MS : POLL_MS
      timer = window.setTimeout(async () => {
        await refresh()
        schedule()
      }, ms)
    }

    void refresh().then(() => schedule())

    const onQueued = (e: Event) => {
      const detail = (e as CustomEvent<{ matchId?: string }>).detail
      if (detail?.matchId === matchId) {
        fastPollUntil.current = Date.now() + 30_000
        setAnalyzing(true)
        void refresh()
      }
    }

    window.addEventListener("ttm-analysis-queued", onQueued)

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
      window.removeEventListener("ttm-analysis-queued", onQueued)
    }
  }, [matchId, refresh])

  return { score, analyzing, configured, loading, refresh }
}
