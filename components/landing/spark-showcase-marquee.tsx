"use client"

import { SparkDemoProfileCard } from "@/components/landing/spark-demo-profile-card"
import { SPARK_DEMO_PROFILES } from "@/components/landing/spark-demo-profiles"
import { SparkTiltCard } from "@/components/landing/spark-tilt-card"
import { cn } from "@/lib/utils"

export function SparkShowcaseMarquee() {
  const loop = [...SPARK_DEMO_PROFILES, ...SPARK_DEMO_PROFILES]

  return (
    <>
      <div className="spark-showcase-marquee md:hidden" role="presentation">
        <div className="spark-landing__showcase-track spark-landing__showcase-track--scroll">
          {SPARK_DEMO_PROFILES.map((profile) => (
            <div key={profile.name} className="spark-landing__showcase-item">
              <SparkDemoProfileCard profile={profile} interactive />
            </div>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "spark-showcase-marquee hidden md:block",
          "group/marquee"
        )}
        role="presentation"
      >
        <div className="spark-showcase-marquee__fade spark-showcase-marquee__fade--left" aria-hidden />
        <div className="spark-showcase-marquee__fade spark-showcase-marquee__fade--right" aria-hidden />
        <div className="spark-showcase-marquee__viewport">
          <div className="spark-showcase-marquee__track group-hover/marquee:[animation-play-state:paused]">
            {loop.map((profile, i) => (
              <div
                key={`${profile.name}-${i}`}
                className="spark-showcase-marquee__item group/card"
              >
                <SparkTiltCard innerClassName="h-full">
                  <SparkDemoProfileCard profile={profile} interactive className="h-full" />
                </SparkTiltCard>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
