"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Clock, Lightbulb, MessageCircle, Sparkles, TrendingUp } from "lucide-react"
import { useI18n, type TranslationKey } from "@/client/lib/i18n"
import { interestLabelBySlug } from "@/client/lib/interest-labels"
import { gameText, promptText } from "@/client/lib/blind-date-games-text"
import { blindDateApi, type ConnectionReport } from "@/client/lib/blind-date-client"

function fill(text: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), text)
}

/** Connection Report sheet: facts from the date, plus AI notes only when both people allowed AI. */
export function BlindReport({ roomId, peerName, onClose }: { roomId: string; peerName: string; onClose: () => void }) {
  const { t, locale } = useI18n()
  const [report, setReport] = useState<ConnectionReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    void blindDateApi.insights(roomId, locale).then((res) => {
      if (!alive) return
      if (res.ok) setReport(res.data)
      else setError(res.error)
    })
    return () => {
      alive = false
    }
  }, [roomId, locale])

  if (error) {
    return (
      <div className="bd-insight">
        <p className="bd-sheet__text">{t(error === "unavailable" ? "bdReportUnavailable" : "bdErr_generic")}</p>
        <button type="button" className="bd-btn bd-btn--ghost" onClick={onClose}>
          {t("bdClose")}
        </button>
      </div>
    )
  }
  if (!report) {
    return (
      <div className="bd-insight" aria-busy>
        <p className="bd-sheet__title">{t("bdReportTitle")}</p>
        <p className="bd-round__wait">{t("bdReportLoading")}</p>
      </div>
    )
  }

  const texts = gameText(locale)
  const starter = (s: ConnectionReport["starters"][number]): string => {
    if (s.kind === "interest") return fill(t("bdStarterInterest"), { x: interestLabelBySlug(s.slug, locale) })
    if (s.kind === "answer") return fill(t("bdStarterAnswer"), { x: promptText(locale, s.prompt).o[s.option] ?? "" })
    return t(`bdStarterGeneric${((s.id - 1) % 4) + 1}` as TranslationKey)
  }
  const aiNote: TranslationKey | null =
    report.aiStatus === "ok"
      ? null
      : report.aiStatus === "no_consent"
        ? "bdReportAiOff"
        : report.aiStatus === "too_short"
          ? "bdReportAiShort"
          : report.aiStatus === "limit"
            ? "bdReportAiLimit"
            : "bdReportAiUnavailable"

  return (
    <div className="bd-insight">
      <p className="bd-sheet__title">{t("bdReportTitle")}</p>

      <div className="bd-stats">
        <span>
          <Clock aria-hidden />
          {fill(t("bdReportMinutes"), { n: report.minutes })}
        </span>
        <span>
          <MessageCircle aria-hidden />
          {fill(t("bdReportMessages"), { mine: report.messages.mine, theirs: report.messages.theirs, name: peerName })}
        </span>
        <span>
          <TrendingUp aria-hidden />
          {fill(t("bdReportProgress"), { n: report.progress })}
        </span>
      </div>

      {report.ai && (
        <section className="bd-report-ai">
          <p className="bd-report-ai__label">
            <Sparkles aria-hidden />
            {t("bdReportAiLabel")}
          </p>
          {report.ai.summary && <p className="bd-report-ai__summary">{report.ai.summary}</p>}
          {report.ai.themes.length > 0 && (
            <div className="bd-common">
              {report.ai.themes.map((x) => (
                <span key={x} className="bd-chip">
                  {x}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {report.sharedInterests.length > 0 && (
        <section>
          <p className="bd-report__h">{t("bdReportInterests")}</p>
          <div className="bd-common">
            {report.sharedInterests.map((slug) => (
              <span key={slug} className="bd-chip">
                {interestLabelBySlug(slug, locale)}
              </span>
            ))}
          </div>
        </section>
      )}

      {report.sameAnswers.length > 0 && (
        <section>
          <p className="bd-report__h">{t("bdReportSame")}</p>
          <ul className="bd-report__list">
            {report.sameAnswers.slice(0, 6).map((s, i) => {
              const p = promptText(locale, s.prompt)
              return (
                <li key={i}>
                  <span>{p.q}</span> <b>{p.o[s.option]}</b>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {report.games.length > 0 && (
        <section>
          <p className="bd-report__h">{t("bdReportGames")}</p>
          <ul className="bd-report__list">
            {report.games.map((g, i) => (
              <li key={i}>
                <span>{texts.games[g.key]?.title}</span>{" "}
                {g.result && g.result.comparable > 0 && <b>{fill(t("bdGameScore"), { m: g.result.matches, n: g.result.comparable })}</b>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <p className="bd-report__h">
          <Lightbulb aria-hidden />
          {t("bdReportStarters")}
        </p>
        <ul className="bd-report__list bd-report__list--starters">
          {(report.ai?.starters.length ? report.ai.starters : report.starters.map(starter)).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>

      {aiNote && (
        <p className="bd-report__note">
          {t(aiNote)}{" "}
          {report.aiStatus === "no_consent" && !report.myAiConsent && (
            <Link href="/settings?section=privacy" className="bd-report__link">
              {t("bdReportAiEnable")}
            </Link>
          )}
        </p>
      )}
      <p className="bd-summary__note">{t("bdReportDisclaimer")}</p>
      <button type="button" className="bd-btn bd-btn--ghost" onClick={onClose}>
        {t("bdClose")}
      </button>
    </div>
  )
}
