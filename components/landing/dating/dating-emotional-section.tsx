"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { useI18n } from "@/lib/i18n"
import { isLoggedIn } from "@/lib/user-profile"

export function DatingEmotionalSection() {
  const { t } = useI18n()
  const [ctaHref, setCtaHref] = useState("/register")

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <section className="ttm-dating-section ttm-dating-section--compact ttm-dating-emotional ttm-dating-emotional--final" aria-labelledby="dating-emotional-title">
      <div className="ttm-dating-emotional__glow" aria-hidden />
      <div className="ttm-dating-container ttm-dating-emotional__inner">
        <DatingScrollReveal y={36}>
          <blockquote id="dating-emotional-title" className="ttm-dating-emotional__quote">
            <p className="ttm-dating-emotional__line">{t("datingEmotional1")}</p>
            <p className="ttm-dating-emotional__line ttm-dating-emotional__line--dim">
              {t("datingEmotional2")}
            </p>
            <p className="ttm-dating-emotional__line ttm-dating-emotional__line--accent">
              {t("datingEmotional3")}
            </p>
          </blockquote>
        </DatingScrollReveal>

        <DatingScrollReveal delay={0.15}>
          <Link href={ctaHref} className="ttm-dating-cta ttm-dating-cta--ghost">
            {t("datingEmotionalCta")}
          </Link>
        </DatingScrollReveal>
      </div>
    </section>
  )
}
