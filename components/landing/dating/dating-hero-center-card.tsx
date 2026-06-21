"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { useDatingHeroProfiles } from "@/components/landing/dating/use-dating-profiles"
import { cn } from "@/lib/utils"

export function DatingHeroCenterCard() {
  const reduce = useReducedMotion()
  const profiles = useDatingHeroProfiles()
  const center = profiles[2] ?? profiles[1]

  if (!center) return null

  return (
    <motion.figure
      className={cn(
        "ttm-dating-hero__portrait-center",
        !reduce && "ttm-dating-hero__portrait-center--float"
      )}
      initial={reduce ? false : { opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <div className="ttm-dating-hero__portrait-center-frame">
        <Image
          src={center.imageUrl}
          alt=""
          fill
          className="object-cover object-[center_20%]"
          sizes="120px"
          draggable={false}
        />
        <div className="ttm-dating-hero__portrait-shade" />
      </div>
      <figcaption className="ttm-dating-hero__portrait-center-caption">
        {center.name}, {center.age}
      </figcaption>
    </motion.figure>
  )
}
