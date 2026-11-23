"use client"

import "../settings/settings-luvia.css"
import Link from "next/link"
import { ChevronRight, FileText, HelpCircle, Lock, Shield, Sparkles, Timer } from "lucide-react"
import { Navbar } from "@/client/components/navbar"
import { Logo } from "@/client/components/logo"
import { useI18n } from "@/client/lib/i18n"

/** Only what the product actually does (see docs/LUVIA_2_DEPLOY.md). */
const FACTS = [
  { icon: Timer, titleKey: "lvAbout24Title" as const, bodyKey: "lvAbout24Body" as const },
  { icon: Shield, titleKey: "lvAboutSafetyTitle" as const, bodyKey: "lvAboutSafetyBody" as const },
  { icon: Sparkles, titleKey: "lvAboutAiTitle" as const, bodyKey: "lvAboutAiBody" as const },
  { icon: Lock, titleKey: "lvAboutPrivacyTitle" as const, bodyKey: "lvAboutPrivacyBody" as const },
]

export default function AboutPage() {
  const { t } = useI18n()

  return (
    <main className="lv-set-page">
      <Navbar />
      <div className="lv-set">
        <div className="lv-about__hero">
          <Logo variant="full" size="md" />
          <h1 className="lv-set__title">{t("lvAboutTitle")}</h1>
          <p className="lv-set__hint">{t("lvAboutBody")}</p>
        </div>

        <div className="lv-set__body">
          <ul className="lv-set__group lv-set__list">
            {FACTS.map(({ icon: Icon, titleKey, bodyKey }) => (
              <li key={titleKey} className="lv-set__row lv-about__fact">
                <span className="lv-set__icon" aria-hidden>
                  <Icon strokeWidth={1.8} />
                </span>
                <span className="lv-set__text">
                  <span className="lv-set__label lv-set__label--wrap">{t(titleKey)}</span>
                  <span className="lv-set__hint">{t(bodyKey)}</span>
                </span>
              </li>
            ))}
          </ul>

          <section className="lv-set__group">
            <Link href="/terms" className="lv-set__row">
              <span className="lv-set__icon" aria-hidden>
                <FileText strokeWidth={1.8} />
              </span>
              <span className="lv-set__text">
                <span className="lv-set__label lv-set__label--wrap">{t("lvTerms")}</span>
              </span>
              <ChevronRight className="lv-set__chevron" aria-hidden strokeWidth={1.8} />
            </Link>
            <Link href="/privacy" className="lv-set__row">
              <span className="lv-set__icon" aria-hidden>
                <Lock strokeWidth={1.8} />
              </span>
              <span className="lv-set__text">
                <span className="lv-set__label lv-set__label--wrap">{t("lvPrivacyPolicy")}</span>
              </span>
              <ChevronRight className="lv-set__chevron" aria-hidden strokeWidth={1.8} />
            </Link>
            <a href="mailto:support@timetomatch.app" className="lv-set__row">
              <span className="lv-set__icon" aria-hidden>
                <HelpCircle strokeWidth={1.8} />
              </span>
              <span className="lv-set__text">
                <span className="lv-set__label">{t("appMeSupport")}</span>
                <span className="lv-set__hint">support@timetomatch.app</span>
              </span>
              <ChevronRight className="lv-set__chevron" aria-hidden strokeWidth={1.8} />
            </a>
          </section>
        </div>
      </div>
    </main>
  )
}
