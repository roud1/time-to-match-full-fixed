"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Navbar } from "@/client/components/navbar"
import { CinematicButton } from "@/client/components/ui/cinematic-button"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"
import { PushNotificationSettings } from "@/client/components/pwa/push-notification-settings"
import { SettingsBlockedList } from "@/client/components/settings/settings-blocked-list"
import { SettingsSubscriptionCard } from "@/client/components/settings/settings-subscription-card"
import { CinematicInviteFlow } from "@/client/components/network/cinematic-invite-flow"
import { pushConnectionSync } from "@/client/lib/connection-sync-client"
import { getUserProfile, getAgeFromBirthdate } from "@/client/lib/user-profile"
import { getProfilePhotos } from "@/client/lib/profile-photos"

type Section = "account" | "security" | "privacy" | "notifications"

export default function SettingsPage() {
  const { t } = useI18n()
  const [section, setSection] = useState<Section>("account")
  const [saved, setSaved] = useState(false)
  const [localProfile, setLocalProfile] = useState(() => getUserProfile())

  useEffect(() => {
    const sync = () => setLocalProfile(getUserProfile())
    window.addEventListener("ttm-auth-changed", sync)
    window.addEventListener("ttm-user-profile-changed", sync)
    return () => {
      window.removeEventListener("ttm-auth-changed", sync)
      window.removeEventListener("ttm-user-profile-changed", sync)
    }
  }, [])

  const nav: { id: Section; label: string }[] = [
    { id: "account", label: t("settingsAccount") },
    { id: "security", label: t("settingsSecurity") },
    { id: "privacy", label: t("settingsPrivacy") },
    { id: "notifications", label: t("settingsNotifications") },
  ]

  const bodyKey =
    section === "account"
      ? "settingsAccountBody"
      : section === "security"
        ? "settingsSecurityBody"
        : section === "privacy"
          ? "settingsPrivacyBody"
          : "settingsNotificationsBody"

  return (
    <main className="min-h-screen bg-transparent ttm-brand-universe">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20 flex flex-col md:flex-row gap-8">
        <nav className="flex md:flex-col gap-2 md:min-w-[180px] p-1 rounded-2xl ttm-brand-glass h-fit" aria-label="Settings">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              aria-current={section === item.id ? "page" : undefined}
              className={cn(
                "flex-1 md:flex-none py-2.5 px-4 rounded-xl text-xs font-extralight transition-colors",
                section === item.id
                  ? "bg-indigo-500/15 text-indigo-100/95"
                  : "text-white/45 hover:text-white/70"
              )}
            >
              {item.label}
            </button>
          ))}
          <Link
            href="/notifications"
            className="md:mt-3 py-2.5 px-4 text-xs font-extralight text-indigo-200/80 hover:text-indigo-100 text-center md:text-left"
          >
            {t("navNotifications")} →
          </Link>
        </nav>

        <motion.div
          key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="ttm-brand-glass flex-1 rounded-[1.75rem] p-6 md:p-8 space-y-6"
        >
          <div>
            <h1 className="ttm-brand-gradient-text text-2xl font-extralight tracking-tight">{t("settingsTitle")}</h1>
            <p className="ttm-type-muted text-sm mt-2 leading-relaxed">{t(bodyKey)}</p>
          </div>

          {section === "notifications" ? (
            <div className="space-y-4 max-w-md">
              <PushNotificationSettings />
              <Link
                href="/notifications"
                className="block rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-4 text-sm font-extralight text-indigo-100/90 hover:border-indigo-400/35 transition-colors"
              >
                {t("settingsNotificationsLink")}
              </Link>
              <button
                type="button"
                onClick={() => void pushConnectionSync()}
                className="text-xs text-indigo-200/70 hover:text-indigo-100 font-light"
              >
                {t("settingsSyncNow")}
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-w-md">
              {section === "privacy" && (
                <>
                  <label className="flex items-center justify-between ttm-brand-glass rounded-2xl px-4 py-3 cursor-pointer">
                    <span className="text-sm font-light text-white/70">{t("settingsPrivacyToggle")}</span>
                    <input type="checkbox" className="accent-indigo-400" defaultChecked />
                  </label>
                  <div>
                    <p className="p9-register-step-label mb-3">{t("trustBlockedListTitle")}</p>
                    <SettingsBlockedList />
                  </div>
                </>
              )}
              {section === "security" && (
                <p className="text-xs text-white/40 font-light">{t("settingsSecurityHint")}</p>
              )}
              {section === "account" && (
                <>
                  <SettingsSubscriptionCard />
                  <CinematicInviteFlow />
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                    <p className="p9-register-step-label">{t("profileDetailsTitle")}</p>
                    <p className="text-sm font-light text-white/70">
                      {localProfile?.name ?? "—"}
                      {localProfile?.birthdate && (
                        <span className="text-white/45">
                          {" "}
                          · {getAgeFromBirthdate(localProfile.birthdate)} {t("profileYears")}
                        </span>
                      )}
                    </p>
                    {localProfile?.bio ? (
                      <p className="text-xs font-light text-white/50 line-clamp-3">{localProfile.bio}</p>
                    ) : null}
                    {(localProfile?.customCity || localProfile?.cityId) && (
                      <p className="text-xs font-light text-white/45">
                        {localProfile.customCity ?? localProfile.cityId}
                        {localProfile.latitude != null && localProfile.longitude != null && (
                          <span className="tabular-nums">
                            {" "}
                            ({localProfile.latitude.toFixed(2)}, {localProfile.longitude.toFixed(2)})
                          </span>
                        )}
                      </p>
                    )}
                    {getProfilePhotos(localProfile ?? {}).length > 0 && (
                      <p className="text-xs text-indigo-200/70 font-light">
                        {getProfilePhotos(localProfile ?? {}).length} photo(s)
                      </p>
                    )}
                    <Link
                      href="/profile?edit=1"
                      className="inline-block text-xs text-indigo-200/80 hover:text-indigo-100 font-light"
                    >
                      {t("profileEdit")} →
                    </Link>
                  </div>
                  <label className="block">
                    <span className="p9-register-step-label block mb-2">{t("settingsDisplayName")}</span>
                    <input
                      type="text"
                      disabled
                      value={localProfile?.name ?? ""}
                      className="w-full rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 text-white/50 font-light outline-none"
                      placeholder="—"
                    />
                  </label>
                </>
              )}
            </div>
          )}

          <CinematicButton
            variant="primary"
            className="w-full max-w-xs min-h-[48px]"
            onClick={() => {
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
            }}
          >
            {saved ? t("settingsSaved") : t("settingsSave")}
          </CinematicButton>
        </motion.div>
      </div>
    </main>
  )
}
