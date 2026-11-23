"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { useI18n } from "@/client/lib/i18n"
import { Logo } from "@/client/components/logo"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer
      className="ttm-site-footer relative py-12 sm:py-16 px-4 sm:px-8 border-t border-[var(--border)]"
      style={{ paddingBottom: "max(3rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2"
          >
            <Logo variant="full" size="sm" />
          </motion.div>

          <motion.div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Link href="/story" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light min-h-[44px] inline-flex items-center">
              {t("storyOverline")}
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light min-h-[44px] inline-flex items-center">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light min-h-[44px] inline-flex items-center">
              {t("terms")}
            </Link>
            <a href="mailto:support@timetomatch.app" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light min-h-[44px] inline-flex items-center">
              {t("contacts")}
            </a>
          </motion.div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 pt-8 border-t border-foreground/5 text-center"
        >
          <p className="text-sm text-muted-foreground/60 font-light">
            © 2026 {t("copyright")}
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
