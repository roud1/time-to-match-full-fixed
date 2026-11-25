"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useI18n, type TranslationKey } from "@/client/lib/i18n"
import { readLvThemePref, setLvThemePref, type LvThemePref } from "@/client/lib/lv-theme"

const OPTIONS: Array<{ value: LvThemePref; key: TranslationKey; Icon: typeof Sun }> = [
  { value: "light", key: "lvThemeLight", Icon: Sun },
  { value: "dark", key: "lvThemeDark", Icon: Moon },
  { value: "system", key: "lvThemeSystem", Icon: Monitor },
]

/** Settings → Appearance: light / dark / follow the system (stored on this device). */
export function AppearanceSettings() {
  const { t } = useI18n()
  const [pref, setPref] = useState<LvThemePref>("dark")

  useEffect(() => setPref(readLvThemePref()), [])

  return (
    <section className="lv-set__group lv-set__group--pad" aria-label={t("lvSetAppearance")}>
      <p className="lv-set__group-title">{t("lvSetAppearance")}</p>
      <div className="lv-seg" role="radiogroup" aria-label={t("lvSetAppearance")}>
        {OPTIONS.map(({ value, key, Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={pref === value}
            className={pref === value ? "lv-seg__opt is-on" : "lv-seg__opt"}
            onClick={() => {
              setPref(value)
              setLvThemePref(value)
            }}
          >
            <Icon aria-hidden strokeWidth={1.8} />
            {t(key)}
          </button>
        ))}
      </div>
    </section>
  )
}
