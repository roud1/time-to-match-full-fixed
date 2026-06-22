"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { useI18n, type TranslationKey } from "@/lib/i18n"

type Plan = {
  nameKey: TranslationKey
  priceKey: TranslationKey
  descKey: TranslationKey
  perks: TranslationKey[]
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    nameKey: "datingPricingFree",
    priceKey: "datingPricingFreePrice",
    descKey: "datingPricingFreeDesc",
    perks: ["datingPricingFreePerk1", "datingPricingFreePerk2", "datingPricingFreePerk3"],
  },
  {
    nameKey: "datingPricingPremium",
    priceKey: "datingPricingPremiumPrice",
    descKey: "datingPricingPremiumDesc",
    perks: ["datingPricingPremiumPerk1", "datingPricingPremiumPerk2", "datingPricingPremiumPerk3"],
    featured: true,
  },
  {
    nameKey: "datingPricingVip",
    priceKey: "datingPricingVipPrice",
    descKey: "datingPricingVipDesc",
    perks: ["datingPricingVipPerk1", "datingPricingVipPerk2", "datingPricingVipPerk3"],
  },
]

export function DatingPricingSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section id="pricing" className="ttm-dating-section ttm-dating-pricing" aria-labelledby="dating-pricing-title">
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <p className="ttm-dating-section__eyebrow">{t("datingPricingEyebrow")}</p>
          <h2 id="dating-pricing-title" className="ttm-dating-section__title">
            {t("datingPricingTitle")}
          </h2>
        </DatingScrollReveal>

        <div className="ttm-dating-pricing__grid">
          {PLANS.map((plan, i) => (
            <motion.article
              key={plan.nameKey}
              className={`ttm-dating-glass-card ttm-dating-pricing__card${plan.featured ? " ttm-dating-pricing__card--featured" : ""}`}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {plan.featured && (
                <span className="ttm-dating-pricing__badge">{t("datingPricingPopular")}</span>
              )}
              <h3 className="ttm-dating-pricing__name">{t(plan.nameKey)}</h3>
              <p className="ttm-dating-pricing__price">
                <span className="ttm-dating-pricing__currency">$</span>
                {t(plan.priceKey)}
                <span className="ttm-dating-pricing__period">/mo</span>
              </p>
              <p className="ttm-dating-pricing__desc">{t(plan.descKey)}</p>
              <ul className="ttm-dating-pricing__perks">
                {plan.perks.map((perkKey) => (
                  <li key={perkKey}>
                    <Check size={14} aria-hidden />
                    {t(perkKey)}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`ttm-dating-cta ttm-dating-cta--block${plan.featured ? "" : " ttm-dating-cta--ghost"}`}
              >
                {t("datingPricingCta")}
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
