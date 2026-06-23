"use client"

import { motion, useReducedMotion } from "motion/react"
import { useMemo } from "react"
import { DatingProfileCard } from "@/client/components/landing/dating/dating-profile-card"
import { useDatingHeroProfiles } from "@/client/components/landing/dating/use-dating-profiles"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type LoginCardSceneProps = {
  variant?: "full" | "compact"
}

export function LoginCardScene({ variant = "full" }: LoginCardSceneProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const profiles = useDatingHeroProfiles()
  const profile = profiles[0]

  const supportProfiles = useMemo(
    () => {
      if (!profile) return []
      return [
        {
          delta: 6,
          km: 4,
          imageUrl:
            "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=420&h=520&fit=crop&q=85",
        },
        {
          delta: 12,
          km: 7,
          imageUrl:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=420&h=520&fit=crop&q=85",
        },
        {
          delta: 18,
          km: 11,
          imageUrl:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=420&h=520&fit=crop&q=85",
        },
      ].map(({ delta, km, imageUrl }, index) => ({
        ...profile,
        age: profile.age + index + 1,
        connectionScore: Math.max(62, profile.connectionScore - delta),
        distance: t("datingKmAway").replace("{km}", String(km)),
        imageUrl,
        verified: false,
      }))
    },
    [profile, t]
  )

  if (!profile) return null

  if (variant === "compact") {
    return (
      <div
        className="ttm-login-scene ttm-login-scene--compact"
        aria-label={t("datingHeroCardsAria")}
      >
        <ul className="ttm-login-scene__compact-list">
          {supportProfiles.map((item, index) => (
            <li key={`${item.name}-${index}`}>
              <DatingProfileCard profile={item} className="ttm-dating-card--mini" />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <motion.div
      className="ttm-login-scene"
      initial={reduce ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      aria-label={t("datingHeroCardsAria")}
    >
      <div className="ttm-login-scene__glow" aria-hidden />
      <div className="ttm-dating-hero__card-cluster ttm-login-scene__cluster">
        <div className="ttm-dating-hero__card-aura" aria-hidden />
        <div className="ttm-dating-hero__cards-under" aria-hidden>
          {supportProfiles.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className={cn(
                "ttm-dating-hero__cards-under-item",
                index === 0 && "ttm-dating-hero__cards-under-item--left",
                index === 1 && "ttm-dating-hero__cards-under-item--center",
                index === 2 && "ttm-dating-hero__cards-under-item--right",
                !reduce && "ttm-dating-hero__cards-under-item--active"
              )}
              style={{ animationDelay: `${index * 0.18}s` }}
            >
              <DatingProfileCard profile={item} className="ttm-dating-card--mini" />
            </div>
          ))}
        </div>
        <div
          className={cn(
            "ttm-dating-hero__card-float",
            !reduce && "ttm-dating-hero__card-float--active"
          )}
        >
          <DatingProfileCard profile={profile} featured className="ttm-dating-card--scene" />
        </div>
      </div>
    </motion.div>
  )
}
