"use client"

import { motion, useReducedMotion } from "motion/react"
import Image from "next/image"
import { useI18n } from "@/lib/i18n"
import { useHydrated } from "@/hooks/use-hydrated"
import { cn } from "@/lib/utils"

const STATUS_KEYS = [
  { secondary: "profileLastChance" as const, urgent: true },
  { secondary: "profileNearby" as const, urgent: false },
  { secondary: "profileActiveToday" as const, urgent: false },
  { secondary: null, urgent: false },
] as const

export function ProfileCards() {
  const { t, profileCards: profiles } = useI18n()
  const hydrated = useHydrated()
  const reduceMotion = useReducedMotion()
  const allowMotion = hydrated && !reduceMotion

  return (
    <section id="profiles" className="relative py-20 md:py-36 px-4 sm:px-6 overflow-hidden">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,900px)] h-[500px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none"
        animate={allowMotion ? { scale: [1, 1.05, 1], opacity: [0.6, 0.85, 0.6] } : undefined}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14 md:mb-24 px-2"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-[10px] md:text-xs font-light tracking-[0.2em] uppercase text-muted-foreground border border-foreground/10 bg-foreground/5 backdrop-blur-md mb-6">
            {t("profilesBadge")}
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] mb-5 text-balance leading-[1.1]">
            {t("profilesTitle")}{" "}
            <span className="bg-gradient-to-r from-pink-300 via-rose-400 to-purple-400 bg-clip-text text-transparent">
              {t("profilesHighlight")}
            </span>{" "}
            {t("profilesTitleEnd")}
          </h2>
          <p className="text-muted-foreground/90 font-extralight text-base md:text-xl max-w-xl mx-auto leading-relaxed">
            {t("profilesSubtitle")}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-7"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {profiles.map((profile, index) => {
            const status = STATUS_KEYS[index] ?? STATUS_KEYS[3]
            const urgent = status.urgent

            return (
              <motion.article
                key={profile.id}
                variants={{
                  hidden: { opacity: 0, y: 56 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={allowMotion ? { y: -12, transition: { duration: 0.4 } } : undefined}
                className={cn("group", allowMotion && index % 2 === 1 && "cinematic-float")}
                style={allowMotion ? { animationDelay: `${index * 0.4}s` } : undefined}
              >
                <div
                  className={cn(
                    "premium-profile-card rounded-[1.85rem] overflow-hidden shadow-2xl shadow-black/50",
                    urgent && "ring-1 ring-pink-500/20"
                  )}
                >
                  <div className="relative aspect-[3/4.15] overflow-hidden">
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
                    />
                    <motion.div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/15 via-transparent to-purple-600/20 opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                    {urgent && allowMotion && <div className="profile-vanish-edge" aria-hidden />}

                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium text-emerald-200 bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                        {t("profileOnline")}
                      </span>
                      {status.secondary && (
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-[9px] uppercase tracking-wider font-medium backdrop-blur-xl border",
                            urgent
                              ? "text-amber-100 bg-amber-500/25 border-amber-500/35"
                              : "text-sky-200/90 bg-sky-500/15 border-sky-500/25"
                          )}
                        >
                          {t(status.secondary)}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-14 right-3 z-10">
                      <div className="px-2.5 py-1.5 rounded-xl glass border border-white/10 flex flex-col items-end">
                        <span className="text-[9px] uppercase tracking-wider text-white/50 font-light">
                          {t("connectionTimerTogether")}
                        </span>
                        <span className="text-xs font-medium tabular-nums text-pink-300">
                          24:00:00
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10 bg-gradient-to-t from-black/80 to-transparent pt-16">
                      <h3 className="text-xl md:text-2xl font-light text-white tracking-tight">
                        {profile.name}, {profile.age}
                      </h3>
                      <p className="text-xs text-white/60 font-light flex items-center gap-1 mt-1.5">
                        <svg className="w-3.5 h-3.5 shrink-0 text-pink-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {profile.location} · {profile.distance}
                      </p>
                    </div>

                    <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-4 z-10 opacity-100 sm:opacity-0 sm:translate-y-3 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-500">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        aria-label="Pass"
                        className="w-12 h-12 sm:w-11 sm:h-11 rounded-full glass border border-white/15 flex items-center justify-center text-white/85 hover:bg-white/10 transition-colors touch-manipulation min-h-[48px] min-w-[48px]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        whileHover={{ scale: 1.06 }}
                        aria-label="Like"
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-pink-500/45 touch-manipulation min-h-[56px] min-w-[56px]"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>

                  <div className="p-4 md:p-5 border-t border-white/5 bg-black/30 backdrop-blur-md">
                    <p className="text-sm text-muted-foreground/90 font-extralight line-clamp-2 leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
