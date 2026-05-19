"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { useI18n } from "@/lib/i18n"

export function ProfileCards() {
  const { t, profileCards: profiles } = useI18n()

  return (
    <section id="profiles" className="relative py-24 px-4 overflow-hidden">
      <motion.div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-600/10 blur-[150px]" />
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-light tracking-widest uppercase text-muted-foreground border border-foreground/10 bg-foreground/5 mb-6">
            {t("profilesBadge") as string}
          </span>
          <h2 className="text-3xl md:text-5xl font-extralight tracking-tight mb-4 text-balance">
            {t("profilesTitle") as string}{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              {t("profilesHighlight") as string}
            </span>{" "}
            {t("profilesTitleEnd") as string}
          </h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            {t("profilesSubtitle") as string}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group"
            >
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-4 right-4">
                    <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                      <span className="text-xs font-light tabular-nums text-foreground/90">
                        {profile.timeLeft}
                      </span>
                    </div>
                  </div>

                  <motion.div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-lg font-light text-white mb-0.5">
                          {profile.name}, {profile.age}
                        </h3>
                        <p className="text-xs text-white/60 font-light flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {profile.location} · {profile.distance}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="p-4 border-t border-foreground/5">
                  <p className="text-sm text-muted-foreground font-light line-clamp-2">
                    {profile.bio}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
