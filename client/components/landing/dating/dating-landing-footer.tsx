"use client"

import Link from "next/link"
import { useI18n } from "@/client/lib/i18n"

const FOOTER_LINKS = [
  { href: "#how", key: "datingNavHow" as const },
  { href: "#preview", key: "datingNavPreview" as const },
  { href: "#features", key: "datingNavFeatures" as const },
  { href: "#pricing", key: "datingNavPricing" as const },
]

export function DatingLandingFooter() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="ttm-dating-footer">
      <div className="ttm-dating-container">
        <div className="ttm-dating-footer__grid">
          <div className="ttm-dating-footer__brand-col">
            <p className="ttm-dating-footer__brand">Time to Match</p>
            <p className="ttm-dating-footer__tagline">{t("datingFooterTagline")}</p>
            <p className="ttm-dating-footer__copy">
              © {year} {t("datingFooterRights")}
            </p>
          </div>
          <nav className="ttm-dating-footer__links" aria-label="Footer">
            {FOOTER_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="ttm-dating-footer__link">
                {t(link.key)}
              </a>
            ))}
            <Link href="/login" className="ttm-dating-footer__link">
              {t("login")}
            </Link>
            <Link href="/register" className="ttm-dating-footer__link">
              {t("register")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
