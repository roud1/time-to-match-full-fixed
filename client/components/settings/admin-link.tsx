"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, ShieldCheck } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"

/** Settings row to the moderation panel, shown only to admin accounts. */
export function AdminLink() {
  const { t } = useI18n()
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    void fetch("/api/admin/session", { credentials: "include" })
      .then((r) => (r.ok ? (r.json() as Promise<{ admin?: boolean }>) : null))
      .then((d) => setAdmin(d?.admin === true))
      .catch(() => null)
  }, [])

  if (!admin) return null
  return (
    <section className="lv-set__group">
      <Link href="/admin" className="lv-set__row">
        <span className="lv-set__icon" aria-hidden>
          <ShieldCheck strokeWidth={1.8} />
        </span>
        <span className="lv-set__text">
          <span className="lv-set__label">{t("lvSetAdmin")}</span>
          <span className="lv-set__hint">{t("lvSetAdminHint")}</span>
        </span>
        <ChevronRight className="lv-set__chevron" aria-hidden strokeWidth={1.8} />
      </Link>
    </section>
  )
}
