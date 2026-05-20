"use client"

import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { getLikedYouProfiles, getSocialState, likeBack } from "@/lib/social-store"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { PresenceBadge, presenceFromProfileId } from "@/components/activity/presence-badge"
import { MatchCelebrationScreen } from "@/components/app/match-celebration-screen"

export function LikesPanel() {
  const { t, locale, location } = useI18n()
  const [likes, setLikes] = useState<SwipeProfile[]>([])
  const [matchedProfile, setMatchedProfile] = useState<SwipeProfile | null>(null)

  const refresh = useCallback(() => {
    const state = getSocialState(locale, location.position)
    const all = getLikedYouProfiles(locale, location.position)
    setLikes(all.filter((p) => !state.matches.includes(p.id)))
  }, [locale, location.position])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const onSocial = () => refresh()
    window.addEventListener("ttm-social-updated", onSocial)
    return () => window.removeEventListener("ttm-social-updated", onSocial)
  }, [refresh])

  const handleLikeBack = (profile: SwipeProfile) => {
    const matched = likeBack(profile.id, locale, location.position)
    if (matched) setMatchedProfile(profile)
    refresh()
  }

  return (
    <div className="px-4 pt-4 pb-6 max-w-lg mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extralight tracking-tight">{t("tabLikes")}</h1>
        <p className="text-sm text-muted-foreground font-light mt-1">{t("likesSubtitle")}</p>
      </div>

      <MatchCelebrationScreen profile={matchedProfile} onClose={() => setMatchedProfile(null)} />

      {likes.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-muted-foreground font-light">{t("likesEmpty")}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {likes.map((profile) => (
            <li
              key={profile.id}
              className="glass-card rounded-2xl p-3 flex items-center gap-3 border border-foreground/10"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <Image src={profile.image} alt={profile.name} fill className="object-cover" sizes="72px" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <p className="font-light text-foreground truncate">
                    {profile.name}, {profile.age}
                  </p>
                  <PresenceBadge
                    variant={presenceFromProfileId(profile.id)}
                    labelOnline={t("presenceOnline")}
                    labelRecent={t("presenceRecent")}
                    labelToday={t("presenceToday")}
                    className="shrink-0"
                  />
                </div>
                <p className="text-xs text-muted-foreground font-light truncate">
                  {profile.location} · {profile.distance}
                </p>
                <p className="text-xs text-pink-400/90 font-light mt-0.5">{t("likesLikedYou")}</p>
              </div>
              <button
                type="button"
                onClick={() => handleLikeBack(profile)}
                className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md"
                aria-label={t("likesLikeBack")}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
