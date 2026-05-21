"use client"

import { motion, useReducedMotion } from "motion/react"
import Image from "next/image"
import { useI18n } from "@/lib/i18n"
import { useHydrated } from "@/hooks/use-hydrated"
import {
  getTimerMoodCardClass,
  getTimerMoodFromMs,
  parseTimeLeftToMs,
} from "@/lib/profile-timer-mood"
import { ProfileTimerMood } from "@/components/ui/profile-timer-mood"
import { cn } from "@/lib/utils"

export function ProfileCards() {
  const { t, profileCards: profiles } = useI18n()
  const hydrated = useHydrated()
  const reduceMotion = useReducedMotion()
  const allowMotion = hydrated && !reduceMotion

  return (
    <section id="profiles" className="relative py-24 md:py-40 px-5 sm:px-8 overflow-hidden">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,720px)] h-[420px] rounded-full bg-white/[0.03] blur-[120px] pointer-events-none"
        animate={allowMotion ? { scale: [1, 1.04, 1], opacity: [0.4, 0.65, 0.4] } : undefined}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 md:mb-28 px-2"
        >
          <span className="ttm-cin-overline inline-block px-4 py-2 rounded-full cin-glass mb-8">
            {t("profilesBadge")}
          </span>
          <h2 className="ttm-cin-headline text-balance mb-6 md:mb-8">
            {t("profilesTitle")}{" "}
            <span className="text-white/55">{t("profilesHighlight")}</span>
            {t("profilesTitleEnd") ? ` ${t("profilesTitleEnd")}` : ""}
          </h2>
          <p className="ttm-cin-sub max-w-lg mx-auto">{t("profilesSubtitle")}</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-7 md:gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {profiles.map((profile, index) => {
            const mood = getTimerMoodFromMs(parseTimeLeftToMs(profile.timeLeft))
            const urgent = mood === "almostGone" || mood === "critical"

            return (
              <motion.article
                key={profile.id}
                variants={{
                  hidden: { opacity: 0, y: 48 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={allowMotion ? { y: -8, transition: { duration: 0.55 } } : undefined}
                className={cn("group", allowMotion && index % 2 === 1 && "cinematic-float")}
                style={allowMotion ? { animationDelay: `${index * 0.5}s` } : undefined}
              >
                <div
                  className={cn(
                    "cin-card relative",
                    getTimerMoodCardClass(mood),
                    urgent && allowMotion && "overflow-hidden"
                  )}
                >
                  <div className="relative aspect-[3/4.2] overflow-hidden">
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      loading="lazy"
                      className="object-cover object-[center_12%] transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-[#050506]/35 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent opacity-80" />
                    {urgent && allowMotion && <div className="cin-vanish-sweep" aria-hidden />}

                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 z-10">
                      <span className="ttm-cin-overline px-2.5 py-1 rounded-full cin-glass text-white/50">
                        {t("profileOnline")}
                      </span>
                      <ProfileTimerMood
                        profileId={profile.id}
                        timeLeft={profile.timeLeft}
                        live
                        size="sm"
                      />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
                      <h3 className="text-2xl md:text-[1.65rem] font-extralight text-white tracking-tight">
                        {profile.name}
                        <span className="text-white/45 font-light">, {profile.age}</span>
                      </h3>
                      <p className="text-[11px] text-white/40 font-light mt-2 tracking-wide">
                        {profile.location}
                      </p>
                    </div>
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
