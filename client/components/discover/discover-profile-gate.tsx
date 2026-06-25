"use client"

import Link from "next/link"
import { useI18n } from "@/client/lib/i18n"
import type { DiscoverProfileGateStatus } from "@/client/lib/discover/profile-gate"

import type { ReactNode } from "react"

type DiscoverProfileGateProps = {
  status: DiscoverProfileGateStatus
  children: ReactNode
}

export function DiscoverProfileGate({ status, children }: DiscoverProfileGateProps) {
  const { t } = useI18n()

  if (status.complete) return <>{children}</>

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center gap-4">
      <h2 className="text-xl font-semibold text-white">{t("discoverGateTitle")}</h2>
      <p className="text-sm text-white/55 max-w-md">{t("discoverGateBody")}</p>
      <ul className="text-sm text-white/45 space-y-1">
        {status.missing.includes("photo") ? <li>{t("discoverGateNeedPhoto")}</li> : null}
        {status.missing.includes("gender") ? <li>{t("discoverGateNeedGender")}</li> : null}
        {status.missing.includes("city") ? <li>{t("discoverGateNeedCity")}</li> : null}
      </ul>
      <Link href="/profile" className="ttm-brand-cta min-w-[200px] inline-flex justify-center">
        {t("discoverGateCta")}
      </Link>
    </div>
  )
}
