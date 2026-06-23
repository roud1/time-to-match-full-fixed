"use client"

import { useCallback, useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import type { TranslationKey } from "@/lib/i18n"
import {
  ADMIN_KEY_STORAGE,
  type AdminReport,
  type AdminReportsResponse,
  type ReportReason,
} from "@/lib/admin/types"
import { CinematicButton } from "@/components/ui/cinematic-button"
import { cn } from "@/lib/utils"
import "@/app/admin/admin.css"

const REASON_KEYS: Record<ReportReason, TranslationKey> = {
  harassment: "adminReasonHarassment",
  spam: "adminReasonSpam",
  fake: "adminReasonFake",
  inappropriate: "adminReasonInappropriate",
  other: "adminReasonOther",
}

type FetchError = "invalid_key" | "not_configured" | "no_database" | "fetch_failed"

async function loadReports(key: string): Promise<AdminReportsResponse> {
  const res = await fetch("/api/admin/reports", {
    headers: { "x-admin-key": key },
    cache: "no-store",
  })

  if (res.status === 403) throw new Error("invalid_key")

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    if (body?.error === "admin_not_configured") throw new Error("not_configured")
    if (body?.error === "service_unavailable") throw new Error("no_database")
    throw new Error("fetch_failed")
  }

  return res.json() as Promise<AdminReportsResponse>
}

function formatReportTime(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}

function displayName(name: string | null, id: string) {
  return name?.trim() || id.slice(0, 8)
}

function AdminLoginForm({
  onSubmit,
  error,
  loading,
}: {
  onSubmit: (key: string) => void
  error: FetchError | null
  loading: boolean
}) {
  const { t } = useI18n()
  const [key, setKey] = useState("")

  const errorMessage =
    error === "invalid_key"
      ? t("adminErrorInvalidKey")
      : error === "not_configured"
        ? t("adminErrorNotConfigured")
        : error === "no_database"
          ? t("adminErrorNoDatabase")
          : error === "fetch_failed"
            ? t("adminErrorFetch")
            : null

  return (
    <section className="ttm-admin-card ttm-admin-login" aria-labelledby="admin-login-title">
      <p className="ttm-admin-eyebrow">{t("adminEyebrow")}</p>
      <h1 id="admin-login-title" className="ttm-admin-title">
        {t("adminTitle")}
      </h1>
      <p className="ttm-admin-subtitle">{t("adminSubtitle")}</p>

      <form
        className="ttm-admin-login__form"
        onSubmit={(e) => {
          e.preventDefault()
          const trimmed = key.trim()
          if (trimmed.length >= 8) onSubmit(trimmed)
        }}
      >
        <label className="ttm-admin-field" htmlFor="admin-key">
          <span className="ttm-admin-field__label">{t("adminKeyLabel")}</span>
          <input
            id="admin-key"
            type="password"
            autoComplete="off"
            className="ttm-admin-field__input"
            placeholder={t("adminKeyPlaceholder")}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            minLength={8}
            required
          />
        </label>

        {errorMessage ? (
          <p className="ttm-admin-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <CinematicButton type="submit" size="compact" disabled={loading || key.trim().length < 8}>
          {loading ? t("adminLoading") : t("adminLogin")}
        </CinematicButton>
      </form>
    </section>
  )
}

function ReportRow({ report, locale }: { report: AdminReport; locale: string }) {
  const { t } = useI18n()

  return (
    <tr className="ttm-admin-table__row ttm-admin-table__row--desktop">
      <td>{displayName(report.reporterName, report.reporterId)}</td>
      <td>{displayName(report.reportedName, report.reportedUserId)}</td>
      <td>{t(REASON_KEYS[report.reason])}</td>
      <td className="ttm-admin-table__comment">{report.comment?.trim() || "—"}</td>
      <td>{formatReportTime(report.createdAt, locale)}</td>
      <td>
        <span className="ttm-admin-status">{t("adminStatusPending")}</span>
      </td>
    </tr>
  )
}

function ReportCard({ report, locale }: { report: AdminReport; locale: string }) {
  const { t } = useI18n()

  return (
    <article className="ttm-admin-report-card">
      <div className="ttm-admin-report-card__row">
        <span className="ttm-admin-report-card__label">{t("adminColReporter")}</span>
        <span>{displayName(report.reporterName, report.reporterId)}</span>
      </div>
      <div className="ttm-admin-report-card__row">
        <span className="ttm-admin-report-card__label">{t("adminColReported")}</span>
        <span>{displayName(report.reportedName, report.reportedUserId)}</span>
      </div>
      <div className="ttm-admin-report-card__row">
        <span className="ttm-admin-report-card__label">{t("adminColReason")}</span>
        <span>{t(REASON_KEYS[report.reason])}</span>
      </div>
      {report.comment?.trim() ? (
        <div className="ttm-admin-report-card__row">
          <span className="ttm-admin-report-card__label">{t("adminColComment")}</span>
          <span className="ttm-admin-report-card__comment">{report.comment}</span>
        </div>
      ) : null}
      <div className="ttm-admin-report-card__footer">
        <time dateTime={report.createdAt}>{formatReportTime(report.createdAt, locale)}</time>
        <span className="ttm-admin-status">{t("adminStatusPending")}</span>
      </div>
    </article>
  )
}

export function AdminReportsExperience() {
  const { t, locale } = useI18n()
  const [adminKey, setAdminKey] = useState<string | null>(null)
  const [reports, setReports] = useState<AdminReport[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<FetchError | null>(null)

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "uk" ? "uk-UA" : "en-GB"

  const refresh = useCallback(async (key: string, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)

    try {
      const data = await loadReports(key)
      setReports(data.reports)
      setCount(data.count)
      sessionStorage.setItem(ADMIN_KEY_STORAGE, key)
      setAdminKey(key)
    } catch (err) {
      const code = (err as Error).message as FetchError
      if (code === "invalid_key") {
        sessionStorage.removeItem(ADMIN_KEY_STORAGE)
        setAdminKey(null)
        setReports([])
        setCount(0)
      }
      setError(code === "invalid_key" ? "invalid_key" : (code as FetchError))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_KEY_STORAGE)
    if (saved) void refresh(saved)
    else setLoading(false)
  }, [refresh])

  const handleLogin = (key: string) => {
    void refresh(key)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE)
    setAdminKey(null)
    setReports([])
    setCount(0)
    setError(null)
  }

  if (!adminKey) {
    return (
      <div className="ttm-admin">
        <AdminLoginForm onSubmit={handleLogin} error={error} loading={loading} />
      </div>
    )
  }

  return (
    <div className="ttm-admin">
      <header className="ttm-admin-header">
        <div>
          <p className="ttm-admin-eyebrow">{t("adminEyebrow")}</p>
          <h1 className="ttm-admin-title">{t("adminReportsTitle")}</h1>
          <p className="ttm-admin-subtitle">
            {t("adminReportsCount").replace("{count}", String(count))}
          </p>
        </div>
        <div className="ttm-admin-header__actions">
          <CinematicButton
            variant="secondary"
            size="compact"
            disabled={refreshing}
            onClick={() => void refresh(adminKey, true)}
          >
            {refreshing ? t("adminLoading") : t("adminRefresh")}
          </CinematicButton>
          <CinematicButton variant="ghost" size="compact" onClick={handleLogout}>
            {t("adminLogout")}
          </CinematicButton>
        </div>
      </header>

      {error ? (
        <p className="ttm-admin-error ttm-admin-error--banner" role="alert">
          {error === "not_configured"
            ? t("adminErrorNotConfigured")
            : error === "no_database"
              ? t("adminErrorNoDatabase")
              : t("adminErrorFetch")}
        </p>
      ) : null}

      <section className={cn("ttm-admin-card", loading && "ttm-admin-card--loading")}>
        {loading ? (
          <p className="ttm-admin-empty">{t("adminLoading")}</p>
        ) : reports.length === 0 ? (
          <p className="ttm-admin-empty">{t("adminReportsEmpty")}</p>
        ) : (
          <>
            <div className="ttm-admin-table-wrap" role="region" aria-label={t("adminReportsTitle")}>
              <table className="ttm-admin-table">
                <thead>
                  <tr>
                    <th>{t("adminColReporter")}</th>
                    <th>{t("adminColReported")}</th>
                    <th>{t("adminColReason")}</th>
                    <th>{t("adminColComment")}</th>
                    <th>{t("adminColTime")}</th>
                    <th>{t("adminColStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <ReportRow key={report.id} report={report} locale={dateLocale} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ttm-admin-cards" aria-label={t("adminReportsTitle")}>
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} locale={dateLocale} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
