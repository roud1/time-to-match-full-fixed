"use client"

import "./discover-profile-gate.css"
import Link from "next/link"
import { Camera, Check, MapPin, User } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"
import type { DiscoverProfileGateStatus } from "@/client/lib/discover/profile-gate"

import type { ReactNode } from "react"

type DiscoverProfileGateProps = {
  status: DiscoverProfileGateStatus
  children: ReactNode
}

const STEPS = [
  { id: "photo", labelKey: "discoverGateNeedPhoto", Icon: Camera },
  { id: "gender", labelKey: "discoverGateNeedGender", Icon: User },
  { id: "city", labelKey: "discoverGateNeedCity", Icon: MapPin },
] as const

export function DiscoverProfileGate({ status, children }: DiscoverProfileGateProps) {
  const { t } = useI18n()

  if (status.complete) return <>{children}</>

  return (
    <>
      {/* Website: unchanged layout */}
      <div className="ttm-gate-classic flex flex-1 flex-col items-center justify-center px-6 py-12 text-center gap-4">
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

      {/* Native app / installed PWA (shown via html[data-ttm-app]) */}
      <div className="ttm-gate">
        <div className="ttm-gate__bar" aria-hidden>
          {STEPS.map(({ id }) => (
            <span key={id} className={cn(!status.missing.includes(id) && "is-done")} />
          ))}
        </div>
        <h2 className="ttm-gate__title">{t("discoverGateTitle")}</h2>
        <p className="ttm-gate__body">{t("discoverGateBody")}</p>
        <ul className="ttm-gate__steps">
          {STEPS.map(({ id, labelKey, Icon }) => {
            const missing = status.missing.includes(id)
            return (
              <li key={id} className={cn("ttm-gate__step", !missing && "is-done")}>
                <span className="ttm-gate__step-icon" aria-hidden>
                  {missing ? <Icon className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                </span>
                <span className="ttm-gate__step-label">{t(labelKey)}</span>
              </li>
            )
          })}
        </ul>
        <Link href="/profile" className="ttm-brand-cta ttm-gate__cta">
          {t("discoverGateCta")}
        </Link>
      </div>
    </>
  )
}
