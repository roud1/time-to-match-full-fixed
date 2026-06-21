"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export function DatingLandingFooter() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="ttm-dating-footer">
      <div className="ttm-dating-container">
        <div className="ttm-dating-footer__grid">
          <div>
            <p className="ttm-dating-footer__brand">Time to Match</p>
            <p className="ttm-dating-footer__copy">
              © {year} {t("datingFooterRights")}
            </p>
          </div>
          <nav className="ttm-dating-footer__links" aria-label="Footer">
            <a href="#ai" className="ttm-dating-footer__link">
              {t("datingNavAi")}
            </a>
            <a href="#how" className="ttm-dating-footer__link">
              {t("datingNavHow")}
            </a>
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
