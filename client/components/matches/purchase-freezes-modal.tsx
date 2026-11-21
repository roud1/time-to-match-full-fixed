"use client"

import { useEffect, useState } from "react"
import { Snowflake } from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/client/lib/i18n"
import { FREEZE_PACKAGES, type FreezePackageId } from "@/client/lib/freeze-packages"
import { buyFreezes } from "@/client/lib/user/api"
import { getAppMode } from "@/client/lib/auth/client"
import { useSetUserCache, useUser, USER_QUERY_KEY } from "@/client/hooks/use-user"
import { useQueryClient } from "@tanstack/react-query"
import { MATCH_FREEZE_COOLDOWN_MS } from "@/client/lib/expiry"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"

type PurchaseFreezesModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** After purchase, offer to apply freeze immediately. */
  onPurchased?: () => void
}

/**
 * Match freezes: real balance and the free daily freeze from the server.
 * Extra packs have no payment provider yet, so they are offered only in the offline demo
 * (the server refuses unpaid packs in production).
 */
export function PurchaseFreezesModal({ open, onOpenChange, onPurchased }: PurchaseFreezesModalProps) {
  const { t, locale } = useI18n()
  const { user, freezeBalance, hasFreeFreeze } = useUser()
  const [loadingId, setLoadingId] = useState<FreezePackageId | null>(null)
  const [localDemo, setLocalDemo] = useState(false)
  const setUserCache = useSetUserCache()
  const qc = useQueryClient()

  useEffect(() => {
    if (open) void getAppMode().then((m) => setLocalDemo(m === "demo"))
  }, [open])

  const lastFreeze = user?.last_freeze_at ? Date.parse(user.last_freeze_at) : NaN
  const nextFree = Number.isFinite(lastFreeze) ? lastFreeze + MATCH_FREEZE_COOLDOWN_MS : NaN
  const nextFreeLabel = Number.isFinite(nextFree)
    ? new Date(nextFree).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null

  const handleBuy = async (packageId: FreezePackageId) => {
    setLoadingId(packageId)
    try {
      const res = await buyFreezes(packageId)
      if (!res.ok) {
        toast.error(t("freezePurchaseError"))
        return
      }
      setUserCache({ freeze_balance: res.newBalance })
      await qc.invalidateQueries({ queryKey: USER_QUERY_KEY })
      toast.success(t("freezePurchaseSuccess").replace("{count}", String(res.newBalance)))
      onOpenChange(false)
      onPurchased?.()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lv-freeze sm:max-w-md">
        <DialogHeader className="lv-freeze__head">
          <span className="lv-freeze__icon" aria-hidden>
            <Snowflake strokeWidth={1.8} />
          </span>
          <DialogTitle className="lv-freeze__title">{t("lvFreezeTitle")}</DialogTitle>
          <DialogDescription className="lv-freeze__body">{t("lvFreezeBody")}</DialogDescription>
        </DialogHeader>

        <dl className="lv-freeze__stats">
          <div>
            <dt>{t("lvFreezeBalance")}</dt>
            <dd className="tabular-nums">{freezeBalance}</dd>
          </div>
          <div>
            <dd className="lv-freeze__free">
              {hasFreeFreeze || !nextFreeLabel
                ? t("lvFreezeFreeReady")
                : t("lvFreezeFreeAt").replace("{time}", nextFreeLabel)}
            </dd>
          </div>
        </dl>

        {localDemo ? (
          <>
            <ul className="lv-freeze__packs">
              {FREEZE_PACKAGES.map((pack) => (
                <li key={pack.id}>
                  <button
                    type="button"
                    disabled={loadingId != null}
                    onClick={() => void handleBuy(pack.id)}
                    className="lv-freeze__pack"
                  >
                    <span>{t("freezePackCount").replace("{count}", String(pack.count))}</span>
                    <span className="lv-freeze__pack-cta">{loadingId === pack.id ? "…" : t("freezePackBuy")}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="lv-freeze__note">{t("lvFreezeDemoNote")}</p>
          </>
        ) : (
          <p className="lv-freeze__note" role="status">
            {t("lvFreezeBuyUnavailable")}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
