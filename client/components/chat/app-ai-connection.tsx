"use client"

import "./app-ai-connection.css"
import { useEffect } from "react"
import Link from "next/link"
import { createPortal } from "react-dom"
import { motion, useReducedMotion } from "motion/react"
import { Check, ChevronLeft, Loader2, Sparkles, WifiOff } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"
import { usePersistedConnectionScore } from "@/client/hooks/use-persisted-connection-score"

/** The server queues an AI analysis every N messages (server/connection-ai-worker.ts). */
const ANALYSIS_EVERY = 5

type AppAiConnectionProps = {
  matchId: string | null
  peerName: string
  totalMessages: number
  onClose: () => void
}

/**
 * AI Connection of the native app / installed PWA (rendered only when html[data-ttm-app] is set).
 * Shows only a real AI result (OpenRouter, persisted on the server). When the AI API is not configured
 * the screen says so honestly — no invented percentages, no local heuristics presented as AI.
 */
export function AppAiConnection({ matchId, peerName, totalMessages, onClose }: AppAiConnectionProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const { score, analyzing, configured, consent, loading } = usePersistedConnectionScore(matchId)
  const aiScore = score && score.source === "openrouter" ? score : null

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const messagesLeft = ANALYSIS_EVERY - (totalMessages % ANALYSIS_EVERY)

  let state: "loading" | "unavailable" | "consent" | "analyzing" | "ready" | "waiting"
  if (!matchId) state = "unavailable"
  else if (!loading && configured && !consent) state = "consent"
  else if (loading && !score && !configured) state = "loading"
  else if (aiScore) state = "ready"
  else if (!configured) state = "unavailable"
  else if (analyzing) state = "analyzing"
  else state = "waiting"

  const pct = aiScore ? Math.max(0, Math.min(100, Math.round(aiScore.sync))) : 0
  const R = 70
  const C = 2 * Math.PI * R

  const view = (
    <motion.div
      role="dialog"
      aria-modal
      aria-labelledby="app-ai-title"
      className="ttm-app-ai"
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.12 : 0.28 }}
    >
      <div className="ttm-app-ai__top">
        <button type="button" className="ttm-app-ai__back" onClick={onClose} aria-label={t("chatBack")}>
          <ChevronLeft aria-hidden strokeWidth={2} />
        </button>
        <div className="ttm-app-ai__heading">
          <h1 id="app-ai-title">
            AI Connection <span className="ttm-app-ai__chip">AI</span>
          </h1>
          <p>{t("appAiSubtitle").replace("{name}", peerName)}</p>
        </div>
        <span className="ttm-app-ai__spacer" aria-hidden />
      </div>

      <div className="ttm-app-ai__ring" aria-hidden={state !== "ready"}>
        <svg viewBox="0 0 180 180">
          <defs>
            <linearGradient id="ttm-app-ai-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f0abfc" />
              <stop offset="0.5" stopColor="#d946ef" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <circle cx="90" cy="90" r={R} className="ttm-app-ai__track" />
          {state === "ready" && (
            <circle
              cx="90"
              cy="90"
              r={R}
              className="ttm-app-ai__value"
              strokeDasharray={`${(C * pct) / 100} ${C}`}
              transform="rotate(-90 90 90)"
            />
          )}
        </svg>
        <span className="ttm-app-ai__center">
          {state === "ready" ? (
            <span className="ttm-app-ai__pct">{pct}%</span>
          ) : state === "unavailable" ? (
            <WifiOff strokeWidth={1.6} />
          ) : state === "analyzing" || state === "loading" ? (
            <Loader2 strokeWidth={1.6} className="ttm-app-ai__spin" />
          ) : (
            <Sparkles strokeWidth={1.6} />
          )}
        </span>
      </div>

      <div className="ttm-app-ai__text" aria-live="polite">
        {state === "ready" && aiScore ? (
          <>
            <h2>{t("appAiReadyTitle")}</h2>
            {aiScore.insight && <p>{aiScore.insight}</p>}
            {aiScore.memories?.length > 0 && (
              <>
                <h3>{t("appAiWhy")}</h3>
                <ul>
                  {aiScore.memories.slice(0, 4).map((m) => (
                    <li key={`${m.id}-${m.at}`}>
                      <Check aria-hidden strokeWidth={2.6} />
                      {m.label}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="ttm-app-ai__note">
              {t("appAiBasedOn").replace("{count}", String(aiScore.messageCount))}
            </p>
          </>
        ) : state === "unavailable" ? (
          <>
            <h2>{t("appAiUnavailableTitle")}</h2>
            <p>{t("appAiUnavailableBody")}</p>
          </>
        ) : state === "consent" ? (
          <>
            <h2>{t("appAiConsentTitle")}</h2>
            <p>{t("appAiConsentBody")}</p>
            <Link href="/settings?section=privacy" className="ttm-app-ai__link" onClick={onClose}>
              {t("appAiConsentAction")}
            </Link>
          </>
        ) : state === "analyzing" || state === "loading" ? (
          <>
            <h2>{t("appAiAnalyzingTitle")}</h2>
            <p>{t("appAiAnalyzingBody")}</p>
          </>
        ) : (
          <>
            <h2>{t("appAiWaitingTitle")}</h2>
            <p>{t("appAiWaitingBody").replace("{count}", String(messagesLeft))}</p>
          </>
        )}
      </div>

      <div className="ttm-app-ai__actions">
        <button type="button" className="ttm-app-ai__primary" onClick={onClose}>
          {t("appAiContinue")}
        </button>
      </div>
    </motion.div>
  )

  if (typeof document === "undefined") return null
  return createPortal(view, document.body)
}
