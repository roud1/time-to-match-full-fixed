"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { DatingParallaxBg } from "@/client/components/landing/dating/dating-parallax-bg"
import { DatingParallaxLayer } from "@/client/components/landing/dating/dating-parallax-layer"
import { DatingScrollReveal } from "@/client/components/landing/dating/dating-scroll-reveal"
import { useSectionParallaxY } from "@/client/hooks/use-parallax"
import { useI18n } from "@/client/lib/i18n"
import { isLoggedIn } from "@/client/lib/user-profile"

export function DatingEmotionalSection() {
  const { t } = useI18n()
  const [ctaHref, setCtaHref] = useState("/register")
  const sectionRef = useRef<HTMLElement>(null)
  const roseBlobY = useSectionParallaxY(sectionRef, [-50, 50], 1)
  const amberBlobY = useSectionParallaxY(sectionRef, [-35, 35], 0.7)

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <section
      ref={sectionRef}
      className="ttm-dating-emotional"
      aria-labelledby="dating-emotional-title"
    >
      <div className="ttm-dating-emotional__parallax" aria-hidden>
        <DatingParallaxBg />
        <DatingParallaxLayer
          y={roseBlobY}
          className="ttm-dating-emotional__parallax-blob ttm-dating-emotional__parallax-blob--rose"
        />
        <DatingParallaxLayer
          y={amberBlobY}
          className="ttm-dating-emotional__parallax-blob ttm-dating-emotional__parallax-blob--amber"
        />
      </div>
      <div className="ttm-dating-emotional__band">
        <div className="ttm-dating-container ttm-dating-emotional__inner">
          <DatingScrollReveal y={36} depth={0.6}>
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

          <DatingScrollReveal delay={0.15} depth={0.35}>
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
