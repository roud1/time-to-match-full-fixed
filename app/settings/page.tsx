"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { TtmButton } from "@/components/ds/ttm-button"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Section = "account" | "security" | "privacy" | "notifications"

export default function SettingsPage() {
  const { t } = useI18n()
  const [section, setSection] = useState<Section>("account")

  const nav: { id: Section; label: string }[] = [
    { id: "account", label: t("settingsAccount") },
    { id: "security", label: t("settingsSecurity") },
    { id: "privacy", label: t("settingsPrivacy") },
    { id: "notifications", label: t("settingsNotifications") },
  ]

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="ttm-dashboard pt-28">
        <nav className="ttm-dashboard-nav" aria-label="Settings">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              aria-current={section === item.id ? "page" : undefined}
              className={cn(section === item.id && "bg-white/[0.06] text-[var(--ttm-text)]")}
            >
              {item.label}
            </button>
          ))}
          <Link href="/notifications" className="mt-4 text-sm text-[var(--ttm-warm)]">
            {t("navNotifications")}
          </Link>
        </nav>

        <div className="ttm-card p-6 md:p-8 space-y-6">
          <h1 className="ttm-h2">{t("settingsTitle")}</h1>
          <p className="ttm-body text-sm">{section}</p>
          <div className="space-y-4 max-w-md">
            <label className="block">
              <span className="ttm-overline block mb-2">{t("settingsAccount")}</span>
              <input
                type="text"
                className="w-full rounded-2xl bg-[var(--ttm-surface)] border border-[var(--ttm-border)] px-4 py-3 text-[var(--ttm-text)] outline-none focus:border-[var(--ttm-warm)]/40 transition-colors"
                placeholder="—"
              />
            </label>
            <label className="flex items-center justify-between ttm-glass rounded-2xl px-4 py-3">
              <span className="text-sm text-[var(--ttm-text-secondary)]">{t("settingsPrivacy")}</span>
              <input type="checkbox" className="accent-[var(--ttm-warm)]" defaultChecked />
            </label>
          </div>
          <TtmButton className="w-full max-w-xs">{t("settingsSave")}</TtmButton>
        </div>
      </div>
    </main>
  )
}
