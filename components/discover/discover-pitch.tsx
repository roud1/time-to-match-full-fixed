"use client"

import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type DiscoverPitchProps = {
  className?: string
  name?: string | null
}

export function DiscoverPitch({ className, name }: DiscoverPitchProps) {
  const { t } = useI18n()
  const chips = [t("welcomeChipMatch24"), t("discoverResonanceLabel"), t("profileChipSync")]

  return (
    <div className={className}>
      <p className="ttm-welcome-page__eyebrow">{t("discoverRitualEyebrow")}</p>
      <h1 className="ttm-welcome-page__title">
        {name ? (
          <>
            {t("discoverTitle")}, <em>{name}</em>
          </>
        ) : (
          t("discoverTitle")
        )}
      </h1>
      <p className="ttm-welcome-page__lead">{t("discoverPanelSubtitle")}</p>
      <ul className="ttm-welcome-page__chips" aria-label={t("profileBandChipsAria")}>
        {chips.map((chip) => (
          <li key={chip} className="ttm-welcome-page__chip">
            {chip}
          </li>
        ))}
      </ul>
    </div>
  )
}
