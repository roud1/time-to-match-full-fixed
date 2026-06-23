"use client"

import { useState } from "react"
import { Snowflake } from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/client/lib/i18n"
import { FREEZE_PACKAGES, type FreezePackageId } from "@/client/lib/freeze-packages"
import { buyFreezes } from "@/client/lib/user/api"
import { useSetUserCache } from "@/client/hooks/use-user"
import { useQueryClient } from "@tanstack/react-query"
import { USER_QUERY_KEY } from "@/client/hooks/use-user"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import { cn } from "@/client/lib/utils"

type PurchaseFreezesModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** After purchase, offer to apply freeze immediately. */
  onPurchased?: () => void
}

export function PurchaseFreezesModal({
  open,
  onOpenChange,
  onPurchased,
}: PurchaseFreezesModalProps) {
  const { t } = useI18n()
  const [loadingId, setLoadingId] = useState<FreezePackageId | null>(null)
  const setUserCache = useSetUserCache()
  const qc = useQueryClient()

  const handleBuy = async (packageId: FreezePackageId) => {
    setLoadingId(packageId)
    try {
      const res = await buyFreezes(packageId)
      if (!res.ok) {
        toast.error(res.message ?? t("freezePurchaseError"))
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
      <DialogContent className="border-white/12 bg-[#0a0a0c]/98 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-extralight text-white/95">
            <Snowflake className="w-5 h-5 text-cyan-300/90" strokeWidth={1.5} aria-hidden />
            {t("freezePurchaseTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm font-light text-white/50">
            {t("freezePurchaseSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <ul className="grid gap-3 py-2">
          {FREEZE_PACKAGES.map((pack) => (
            <li key={pack.id}>
              <button
                type="button"
                disabled={loadingId != null}
                onClick={() => void handleBuy(pack.id)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors touch-manipulation",
                  "border-white/12 bg-white/[0.04] hover:border-cyan-400/30 hover:bg-cyan-500/10",
                  loadingId === pack.id && "opacity-60"
                )}
              >
                <div>
                  <p className="text-sm font-light text-white/90">{t(pack.nameKey)}</p>
                  <p className="text-xs text-white/45 font-extralight mt-0.5">
                    {t("freezePackCount").replace("{count}", String(pack.count))}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm tabular-nums text-cyan-200/90">{pack.priceLabel}</p>
                  <p className="text-[10px] text-white/35 uppercase tracking-wider mt-0.5">
                    {loadingId === pack.id ? "…" : t("freezePackBuy")}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
