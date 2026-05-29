"use client"

import { useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { getSwipeProfilePhotos } from "@/lib/swipe-profile-photos"
import { computeDiscoverCompatibility } from "@/lib/discover-compatibility"
import { computeInterestOverlapForProfile } from "@/lib/discover/interest-overlap"
import { CompatibilityPreview } from "@/components/discover/compatibility-preview"
import type { PeerTrustSignals } from "@/lib/demo-trust-signals"
import { PeerTrustChip } from "@/components/trust/peer-trust-chip"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { cn } from "@/lib/utils"

type SwipeProfileDetailScreenProps = {
  profile: SwipeProfile | null
  initialPhotoIndex?: number
  trust?: PeerTrustSignals
  /** Discover shows like/nope; chat is view-only. */
  context?: "discover" | "chat"
  onClose: () => void
  onLike: () => void
  onNope: () => void
  onOpenSafety?: () => void
}

export function SwipeProfileDetailScreen({
  profile,
  initialPhotoIndex: _initialPhotoIndex = 0,
  trust,
  context = "discover",
  onClose,
  onLike,
  onNope,
  onOpenSafety,
}: SwipeProfileDetailScreenProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const open = profile != null
  const photos = profile ? getSwipeProfilePhotos(profile) : []

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const heroPhoto = photos[0]
  const otherPhotos = photos.slice(1)
  const photoVerified = profile?.photoVerified === true
  const compatibility = profile ? computeDiscoverCompatibility(profile) : null
  const interestOverlap = profile ? computeInterestOverlapForProfile(profile) : null
  const matchPct = interestOverlap?.compatibility ?? compatibility?.resonancePercent ?? 0
  const highCompat = matchPct > 70

  return (
    <AnimatePresence>
      {open && profile && heroPhoto && (
        <motion.div
          key={profile.id}
          role="dialog"
          aria-modal
          aria-labelledby="swipe-profile-detail-title"
          className={cn(
            "fixed inset-0 flex flex-col bg-[#050508]",
            context === "chat" ? "z-[80]" : "z-[75]"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.12 : 0.28 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.2),transparent_60%)]" />

          <div className="relative z-[1] flex flex-1 flex-col min-h-0 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-sm font-light text-muted-foreground hover:text-foreground px-2 py-2 touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
                {t("swipeProfileClose")}
              </button>
              {onOpenSafety && (
                <button
                  type="button"
                  onClick={onOpenSafety}
                  className="w-10 h-10 rounded-xl border border-white/12 bg-white/[0.06] flex items-center justify-center text-white/85 hover:text-white touch-manipulation"
                  aria-label={t("trustSafetyOpenAria")}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-4">
              <div className="relative mx-auto w-full max-w-md aspect-[3/4.2] rounded-[1.75rem] overflow-hidden border border-white/[0.12] shadow-[0_32px_100px_-32px_rgba(0,0,0,0.85)]">
                <Image
                  src={heroPhoto}
                  alt={profile.name}
                  fill
                  className="object-cover object-[center_15%]"
                  sizes="(max-width: 768px) 100vw, 480px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />

                <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center gap-1.5 pointer-events-none">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-emerald-200/95 bg-black/45 border border-emerald-500/30 backdrop-blur-md">
                    {t("profileOnline")}
                  </span>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-black/45 border border-white/10 backdrop-blur-md ml-auto tabular-nums"
                    title={`${t("swipeMatchWord")} ${matchPct}%`}
                  >
                    {matchPct}%
                  </span>
                </div>
              </div>

              <div className="mx-auto max-w-md mt-5 space-y-4">
                <div>
                  <h2
                    id="swipe-profile-detail-title"
                    className="text-2xl font-extralight tracking-tight text-white flex items-center gap-2 flex-wrap"
                  >
                    <span>
                      {profile.name}
                      <span className="text-white/55 font-light text-xl">, {profile.age}</span>
                    </span>
                    {photoVerified && (
                      <VerifiedBadge size={18} title={t("photoVerifiedLabel")} />
                    )}
                  </h2>
                  <p className="text-muted-foreground text-sm font-light mt-1">
                    {profile.location} · {profile.distance}
                  </p>
                </div>

                <p className="text-white/90 text-sm font-light leading-relaxed">{profile.bio}</p>

                {interestOverlap && interestOverlap.compatibility > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                    <p
                      className={cn(
                        "text-4xl font-extralight tabular-nums",
                        highCompat ? "text-emerald-300" : "text-white/90"
                      )}
                    >
                      {interestOverlap.compatibility}%
                    </p>
                    <p className="text-xs text-muted-foreground font-light mt-1">{t("discoverCompatibilityLabel")}</p>
                    {interestOverlap.commonInterests.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                        {interestOverlap.commonInterests.map((tag) => (
                          <span
                            key={`${tag.id}-${tag.name}`}
                            className="px-2 py-0.5 rounded-full text-[10px] font-light border border-white/12 bg-black/30 text-white/85"
                          >
                            {tag.emoji ? `${tag.emoji} ` : ""}
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {compatibility && <CompatibilityPreview compatibility={compatibility} />}

                <div className="flex flex-wrap items-center gap-2">
                  {trust && (
                    <PeerTrustChip
                      signals={trust}
                      labels={{
                        trustShort: t("trustPeerShort"),
                        verified: t("trustPeerVerified"),
                        review: t("trustPeerReview"),
                      }}
                    />
                  )}
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2.5 py-1 rounded-full text-xs font-light bg-white/[0.06] text-white/85 border border-white/10"
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                {otherPhotos.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <h3 className="text-xs font-light uppercase tracking-wider text-muted-foreground">
                      {t("profilePhotos")}
                    </h3>
                    <div className="space-y-3">
                      {otherPhotos.map((src, i) => (
                        <div
                          key={`${src}-${i}`}
                          className="relative w-full aspect-[3/4.2] rounded-[1.25rem] overflow-hidden border border-white/[0.1] bg-white/[0.03]"
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover object-[center_15%]"
                            sizes="(max-width: 768px) 100vw, 480px"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {context !== "chat" && (
            <div className="shrink-0 flex items-center justify-center gap-5 px-6 pt-3 pb-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onClose()
                  onNope()
                }}
                aria-label={t("discoverPassLabel")}
                className="h-14 w-14 rounded-full flex items-center justify-center touch-manipulation border border-white/12 bg-white/[0.04] text-white/50"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onClose()
                  onLike()
                }}
                aria-label={t("discoverConnectLabel")}
                className="h-16 w-16 rounded-full flex items-center justify-center touch-manipulation text-white bg-gradient-to-br from-white/18 to-white/8 border border-white/14 shadow-[0_16px_48px_-8px_rgba(220,225,255,0.35)]"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </motion.button>
            </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
