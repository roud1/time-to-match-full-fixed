"use client"

import { ProfilePhotoImage } from "@/client/components/ui/profile-photo-image"
import { motion, useReducedMotion } from "motion/react"
import { useDatingHeroProfiles } from "@/client/components/landing/dating/use-dating-profiles"
import { cn } from "@/client/lib/utils"

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
        <ProfilePhotoImage
          src={center.imageUrl}
          className="object-cover object-[center_20%]"
          sizes="120px"
        />
        <div className="ttm-dating-hero__portrait-shade" />
      </div>
      <figcaption className="ttm-dating-hero__portrait-center-caption">
        {center.name}, {center.age}
      </figcaption>
    </motion.figure>
  )
}
