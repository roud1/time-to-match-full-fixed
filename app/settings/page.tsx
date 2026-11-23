"use client"

import "./settings-luvia.css"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, ChevronRight, Download, KeyRound, LogOut, Share2, Trash2, UserRound } from "lucide-react"
import { Navbar } from "@/client/components/navbar"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"
import { PushNotificationSettings } from "@/client/components/pwa/push-notification-settings"
import { SettingsBlockedList } from "@/client/components/settings/settings-blocked-list"
import { SettingsSubscriptionCard } from "@/client/components/settings/settings-subscription-card"
import { pushConnectionSync } from "@/client/lib/connection-sync-client"
import { clearSession, getAgeFromBirthdate, getUserProfile } from "@/client/lib/user-profile"
import { getProfilePhotos } from "@/client/lib/profile-photos"
import { logoutOnServer } from "@/client/lib/auth/client"
import { getCityLabel } from "@/client/lib/cities"

type Section = "account" | "security" | "privacy" | "notifications"

export default function SettingsPage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [section, setSection] = useState<Section>("account")
  const [copied, setCopied] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  // Local profile cache is client-only: read it after mount (no hydration mismatch).
  const [localProfile, setLocalProfile] = useState<ReturnType<typeof getUserProfile>>(null)

  // Deep link from the app profile: /settings?section=privacy | notifications | security
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("section")
    if (requested === "privacy" || requested === "notifications" || requested === "security" || requested === "account") {
      setSection(requested)
    }
  }, [])

  useEffect(() => {
    const sync = () => setLocalProfile(getUserProfile())
    sync()
    window.addEventListener("ttm-auth-changed", sync)
    window.addEventListener("ttm-user-profile-changed", sync)
    return () => {
      window.removeEventListener("ttm-auth-changed", sync)
      window.removeEventListener("ttm-user-profile-changed", sync)
    }
  }, [])

  // Narrow phones scroll the tab row: keep the active tab in view (also for deep links).
  useEffect(() => {
    document.querySelector(".lv-set__tabs .is-active")?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [section])

  const nav: { id: Section; label: string }[] = [
    { id: "account", label: t("settingsAccount") },
    { id: "security", label: t("settingsSecurity") },
    { id: "privacy", label: t("settingsPrivacy") },
    { id: "notifications", label: t("settingsNotifications") },
  ]

  const handleLogout = () => {
    void logoutOnServer()
    clearSession()
    router.push("/")
  }

  const handleInvite = async () => {
    const url = `${window.location.origin}/`
    const text = t("lvSetInviteMessage")
    if (navigator.share) {
      try {
        await navigator.share({ title: "Luvia", text, url })
        return
      } catch {
        /* cancelled or unsupported — fall back to copying */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked */
    }
  }

  const handleDelete = async () => {
    if (!password || deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch("/api/me", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        clearSession()
        router.replace("/")
        return
      }
      setDeleteError(res.status === 403 ? t("lvSetDeleteWrongPassword") : t("lvSetDeleteError"))
    } catch {
      setDeleteError(t("lvSetDeleteError"))
    }
    setDeleting(false)
  }

  const photoCount = localProfile ? getProfilePhotos(localProfile).length : 0
  const city = localProfile?.customCity ?? (localProfile?.cityId ? getCityLabel(localProfile.cityId, locale) : null)

  return (
    <main className="lv-set-page">
      <Navbar />
      <div className="lv-set">
        <h1 className="lv-set__title">{t("settingsTitle")}</h1>

        <nav className="lv-set__tabs" aria-label={t("settingsTitle")}>
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              aria-current={section === item.id ? "page" : undefined}
              className={cn("lv-set__tab", section === item.id && "is-active")}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="lv-set__body">
          {section === "account" && (
            <>
              <SettingsSubscriptionCard />

              <section className="lv-set__group" aria-label={t("lvSetProfile")}>
                <Link href="/profile?edit=1" className="lv-set__row">
                  <span className="lv-set__icon" aria-hidden>
                    <UserRound strokeWidth={1.8} />
                  </span>
                  <span className="lv-set__text">
                    <span className="lv-set__label">
                      {localProfile?.name ?? t("lvSetProfile")}
                      {localProfile?.birthdate ? `, ${getAgeFromBirthdate(localProfile.birthdate)}` : ""}
                    </span>
                    <span className="lv-set__hint">
                      {[city, photoCount > 0 ? t("lvSetPhotos").replace("{n}", String(photoCount)) : null]
                        .filter(Boolean)
                        .join(" · ") || t("lvSetEditProfile")}
                    </span>
                  </span>
                  <ChevronRight className="lv-set__chevron" aria-hidden strokeWidth={1.8} />
                </Link>
                <button type="button" className="lv-set__row" onClick={() => void handleInvite()}>
                  <span className="lv-set__icon" aria-hidden>
                    <Share2 strokeWidth={1.8} />
                  </span>
                  <span className="lv-set__text">
                    <span className="lv-set__label">{t("lvSetInvite")}</span>
                    <span className="lv-set__hint" aria-live="polite">
                      {copied ? t("netInviteCopied") : t("lvSetInviteBody")}
                    </span>
                  </span>
                  <ChevronRight className="lv-set__chevron" aria-hidden strokeWidth={1.8} />
                </button>
              </section>

              <section className="lv-set__group">
                {/* GDPR: right of access / data portability */}
                <a href="/api/me/export" download className="lv-set__row">
                  <span className="lv-set__icon" aria-hidden>
                    <Download strokeWidth={1.8} />
                  </span>
                  <span className="lv-set__text">
                    <span className="lv-set__label">{t("lvSetExport")}</span>
                    <span className="lv-set__hint">{t("lvSetExportBody")}</span>
                  </span>
                </a>
                <button type="button" className="lv-set__row" onClick={handleLogout}>
                  <span className="lv-set__icon" aria-hidden>
                    <LogOut strokeWidth={1.8} />
                  </span>
                  <span className="lv-set__text">
                    <span className="lv-set__label">{t("profileLogout")}</span>
                    <span className="lv-set__hint">{t("lvSetSessionBody")}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="lv-set__row lv-set__row--danger"
                  onClick={() => {
                    setDeleteOpen(true)
                    setDeleteError(null)
                    setPassword("")
                  }}
                  aria-expanded={deleteOpen}
                >
                  <span className="lv-set__icon" aria-hidden>
                    <Trash2 strokeWidth={1.8} />
                  </span>
                  <span className="lv-set__text">
                    <span className="lv-set__label">{t("lvSetDelete")}</span>
                  </span>
                </button>
                {deleteOpen && (
                  <form
                    className="lv-set__delete"
                    onSubmit={(e) => {
                      e.preventDefault()
                      void handleDelete()
                    }}
                  >
                    <p className="lv-set__delete-body">{t("lvSetDeleteBody")}</p>
                    <label className="lv-set__field">
                      <span>{t("lvSetDeletePassword")}</span>
                      <input
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                      />
                    </label>
                    {deleteError && (
                      <p className="lv-set__error" role="alert">
                        {deleteError}
                      </p>
                    )}
                    <div className="lv-set__delete-actions">
                      <button type="button" className="lv-set__btn" onClick={() => setDeleteOpen(false)}>
                        {t("lvCancel")}
                      </button>
                      <button
                        type="submit"
                        className="lv-set__btn lv-set__btn--danger"
                        disabled={!password || deleting}
                      >
                        {deleting ? "…" : t("lvSetDeleteConfirm")}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </>
          )}

          {section === "security" && (
            <section className="lv-set__group">
              <Link href="/forgot-password" className="lv-set__row">
                <span className="lv-set__icon" aria-hidden>
                  <KeyRound strokeWidth={1.8} />
                </span>
                <span className="lv-set__text">
                  <span className="lv-set__label">{t("lvSetChangePassword")}</span>
                  <span className="lv-set__hint">{t("lvSetChangePasswordBody")}</span>
                </span>
                <ChevronRight className="lv-set__chevron" aria-hidden strokeWidth={1.8} />
              </Link>
              <button type="button" className="lv-set__row" onClick={handleLogout}>
                <span className="lv-set__icon" aria-hidden>
                  <LogOut strokeWidth={1.8} />
                </span>
                <span className="lv-set__text">
                  <span className="lv-set__label">{t("profileLogout")}</span>
                  <span className="lv-set__hint">{t("lvSetSessionBody")}</span>
                </span>
              </button>
            </section>
          )}

          {section === "privacy" && (
            <section className="lv-set__group lv-set__group--pad">
              <p className="lv-set__group-title">{t("trustBlockedListTitle")}</p>
              <SettingsBlockedList />
            </section>
          )}

          {section === "notifications" && (
            <>
              <section className="lv-set__group lv-set__group--pad">
                <p className="lv-set__hint">{t("lvSetNotificationsBody")}</p>
                <PushNotificationSettings />
              </section>
              <section className="lv-set__group">
                <Link href="/notifications" className="lv-set__row">
                  <span className="lv-set__icon" aria-hidden>
                    <Bell strokeWidth={1.8} />
                  </span>
                  <span className="lv-set__text">
                    <span className="lv-set__label">{t("navNotifications")}</span>
                  </span>
                  <ChevronRight className="lv-set__chevron" aria-hidden strokeWidth={1.8} />
                </Link>
              </section>
              <button type="button" onClick={() => void pushConnectionSync()} className="lv-set__link">
                {t("settingsSyncNow")}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
