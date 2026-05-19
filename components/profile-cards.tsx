"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { useI18n } from "@/lib/i18n"
export function ProfileCards() {
  const { t, profileCards: profiles } = useI18n()

  return (
    <section id="profiles" className="relative py-20 md:py-32 px-4 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,900px)] h-[500px] rounded-full bg-purple-600/8 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 md:mb-20 px-2"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-[10px] md:text-xs font-light tracking-[0.2em] uppercase text-muted-foreground border border-foreground/10 bg-foreground/5 mb-6">
            {t("profilesBadge")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight mb-4 text-balance">
            {t("profilesTitle")}{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent font-semibold">
              {t("profilesHighlight")}
            </span>{" "}
            {t("profilesTitleEnd")}
          </h2>
          <p className="text-muted-foreground font-extralight text-base md:text-lg max-w-xl mx-auto">
            {t("profilesSubtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
          {profiles.map((profile, index) => {
            const urgent = index === 0
            return (
              <motion.article
                key={profile.id}
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10, transition: { duration: 0.35 } }}
                className="group"
              >
                <motion.div className="premium-profile-card rounded-[1.75rem] overflow-hidden shadow-2xl shadow-black/40">
                  <div className="relative aspect-[3/4.2] overflow-hidden">
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10" />
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-600/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        {t("profileOnline")}
                      </span>
                      {urgent && (
                        <span className="px-2 py-1 rounded-full text-[9px] uppercase tracking-wider font-medium text-amber-200 bg-amber-500/20 border border-amber-500/30 backdrop-blur-md">
                          {t("profileLastChance")}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-14 right-3">
                      <div className="px-2.5 py-1.5 rounded-xl glass border border-white/10 flex flex-col items-end">
                        <span className="text-[9px] uppercase tracking-wider text-white/50 font-light">
                          {t("profileExpiresIn")}
                        </span>
                        <span className="text-xs font-medium tabular-nums text-pink-300">
                          {profile.timeLeft}
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                      <h3 className="text-xl md:text-2xl font-light text-white tracking-tight">
                        {profile.name}, {profile.age}
                      </h3>
                      <p className="text-xs text-white/55 font-light flex items-center gap-1 mt-1">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {profile.location} · {profile.distance}
                      </p>
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 md:opacity-100 md:translate-y-0">
                      <button
                        type="button"
                        aria-label="Pass"
                        className="w-12 h-12 rounded-full glass border border-white/15 flex items-center justify-center text-white/80 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all touch-manipulation"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Like"
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all touch-manipulation"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 md:p-5 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                    <p className="text-sm text-muted-foreground font-extralight line-clamp-2 leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                </motion.div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
