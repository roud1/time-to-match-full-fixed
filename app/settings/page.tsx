"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Navbar } from "@/components/navbar"
import { CinematicButton } from "@/components/ui/cinematic-button"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { PushNotificationSettings } from "@/components/pwa/push-notification-settings"
import { CinematicInviteFlow } from "@/components/network/cinematic-invite-flow"
import { pushConnectionSync } from "@/lib/connection-sync-client"

type Section = "account" | "security" | "privacy" | "notifications"

export default function SettingsPage() {
  const { t } = useI18n()
  const [section, setSection] = useState<Section>("account")
  const [saved, setSaved] = useState(false)

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
    <main className="min-h-screen bg-[#050506] ttm-brand-universe">
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
                <label className="flex items-center justify-between ttm-brand-glass rounded-2xl px-4 py-3 cursor-pointer">
                  <span className="text-sm font-light text-white/70">{t("settingsPrivacyToggle")}</span>
                  <input type="checkbox" className="accent-indigo-400" defaultChecked />
                </label>
              )}
              {section === "security" && (
                <p className="text-xs text-white/40 font-light">{t("settingsSecurityHint")}</p>
              )}
              {section === "account" && (
                <>
                  <CinematicInviteFlow />
                  <label className="block">
                    <span className="p9-register-step-label block mb-2">{t("settingsDisplayName")}</span>
                    <input
                      type="text"
                      disabled
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
