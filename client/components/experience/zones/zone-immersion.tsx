"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { GlassPanel } from "@/client/components/experience/primitives/glass-panel"
import { NeonText } from "@/client/components/experience/primitives/neon-text"
import { UrgencyRing } from "@/client/components/experience/primitives/urgency-ring"
import { cn } from "@/client/lib/utils"

const AVATARS = [
  { src: "/images/profile-1.jpg", ring: "from-[var(--xp-pink)] via-[var(--xp-purple)] to-[var(--xp-pink)]" },
  { src: "/images/profile-2.jpg", ring: "from-[var(--xp-purple)] via-[var(--xp-green)] to-[var(--xp-purple)]" },
] as const

function PremiumAvatar({
  src,
  ring,
  synced,
  index,
  reduce,
}: {
  src: string
  ring: string
  synced: boolean
  index: number
  reduce: boolean | null
}) {
  const [failed, setFailed] = useState(false)

  return (
    <motion.div
      className={cn(
        "xp-avatar relative rounded-full bg-gradient-to-br p-[3px] shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        ring
      )}
      animate={
        synced && !reduce
          ? { x: index === 0 ? 14 : -14, scale: 1.06 }
          : { x: 0, scale: 1 }
      }
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <div className="relative h-[4.25rem] w-[4.25rem] overflow-hidden rounded-full ring-2 ring-[var(--xp-base)] sm:h-[5.25rem] sm:w-[5.25rem]">
        {!failed ? (
          <Image
            src={src}
            alt=""
            fill
            className="object-cover object-[center_18%]"
            sizes="(max-width: 640px) 68px, 84px"
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-[var(--xp-surface-2)] to-[var(--xp-surface-3)]"
            aria-hidden
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/10" />
      </div>
      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--xp-base)] bg-[var(--xp-green)] shadow-[0_0_8px_rgba(0,255,163,0.6)]" />
    </motion.div>
  )
}

export function ZoneImmersion() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [synced, setSynced] = useState(false)
  const [pulse, setPulse] = useState(0)

  const handleTap = () => {
    setSynced(true)
    setPulse((p) => p + 1)
    window.setTimeout(() => setSynced(false), 2400)
  }

  return (
    <section className="xp-zone xp-zone--offset-right" aria-label={t("ttmXpImmersionLive")}>
      <p className="xp-label mb-[var(--xp-3)]">{t("ttmXpImmersionLive")}</p>

      <button
        type="button"
        onClick={handleTap}
        className="group w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--xp-green)]"
      >
        <GlassPanel depth={2} className="relative overflow-hidden p-[var(--xp-5)] sm:p-[var(--xp-6)]">
          <div className="xp-asymmetric">
            <div className="relative flex min-h-[200px] items-center justify-center sm:min-h-[240px]">
              <motion.div
                key={pulse}
                className="absolute inset-0 rounded-[var(--xp-radius-md)] bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,163,0.18),transparent_65%)]"
                initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                animate={synced ? { opacity: 1, scale: 1.12 } : { opacity: 0.35, scale: 1 }}
                transition={{ duration: 0.6 }}
              />
              <div className="relative flex items-center gap-5 sm:gap-8">
                {AVATARS.map((avatar, i) => (
                  <PremiumAvatar
                    key={avatar.src}
                    src={avatar.src}
                    ring={avatar.ring}
                    synced={synced}
                    index={i}
                    reduce={reduce}
                  />
                ))}
                <motion.div
                  className="absolute left-1/2 top-1/2 h-px w-14 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--xp-green)] to-transparent sm:w-20"
                  animate={synced ? { scaleX: 1.5, opacity: 1 } : { scaleX: 0.5, opacity: 0.35 }}
                />
              </div>
            </div>

            <div className="flex flex-col justify-center gap-[var(--xp-3)]">
              <NeonText as="h2" variant="green" className="text-2xl font-bold sm:text-3xl">
                {synced ? t("ttmXpImmersionMatched") : t("ttmXpImmersionSync")}
              </NeonText>
              <p className="text-sm leading-relaxed text-[var(--xp-text-muted)] sm:text-base">
                {synced ? t("ttmXpImmersionExpires") : t("ttmXpImmersionTap")}
              </p>
              <div className="mt-1 flex items-center gap-3 sm:mt-2">
                <UrgencyRing totalSeconds={23 * 3600 + 14 * 60 + 52} size={88} criticalBelow={7200} />
                <span className="text-[0.6rem] uppercase leading-snug tracking-[0.2em] text-[var(--xp-text-dim)] sm:text-xs">
                  {t("ttmXpImmersionTimer")}
                </span>
              </div>
            </div>
          </div>
        </GlassPanel>
      </button>
    </section>
  )
}
