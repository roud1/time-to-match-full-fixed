"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { DatingParallaxBg } from "@/components/landing/dating/dating-parallax-bg"
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
    <section className="ttm-dating-emotional" aria-labelledby="dating-emotional-title">
      <div className="ttm-dating-emotional__parallax" aria-hidden>
        <DatingParallaxBg />
        <div className="ttm-dating-emotional__parallax-blob ttm-dating-emotional__parallax-blob--rose" />
        <div className="ttm-dating-emotional__parallax-blob ttm-dating-emotional__parallax-blob--amber" />
      </div>
      <div className="ttm-dating-emotional__band">
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
            <div className="ttm-dating-emotional__cta-wrap">
              <Link href={ctaHref} className="ttm-dating-cta ttm-dating-cta--hero">
                {t("datingEmotionalCta")}
              </Link>
            </div>
          </DatingScrollReveal>
        </div>
      </div>
    </section>
  )
}
