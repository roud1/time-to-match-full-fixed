"use client"

import { useState } from "react"
import { Snowflake } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useUser } from "@/hooks/use-user"
import { PurchaseFreezesModal } from "@/components/matches/purchase-freezes-modal"
import { cn } from "@/lib/utils"

export function FreezeWalletStrip({ className }: { className?: string }) {
  const { t } = useI18n()
  const { freezeBalance, hasFreeFreeze, isLoading } = useUser()
  const [open, setOpen] = useState(false)

  if (isLoading) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "ttm-accent-plaque w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left touch-manipulation hover:border-[var(--accent-soft-border)] transition-[background,border-color,box-shadow]",
          className
        )}
      >
        <span className="flex items-center gap-2 text-sm font-light text-[var(--text-primary)]">
          <Snowflake className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} aria-hidden />
          {t("freezeWalletTitle")}
        </span>
        <span className="text-xs text-[var(--text-secondary)] font-extralight tabular-nums">
          {freezeBalance} ⛄
          {hasFreeFreeze ? ` · ${t("freezeWalletFreeReady")}` : ""}
        </span>
      </button>
      <PurchaseFreezesModal open={open} onOpenChange={setOpen} />
    </>
  )
}
