"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

type SparkCinematicAtmosphereProps = {
  /** Subtle parallax on scroll (landing hero only). */
  parallax?: boolean
}

export function SparkCinematicAtmosphere({ parallax = false }: SparkCinematicAtmosphereProps) {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 800], [0, reduce || !parallax ? 0 : 180])

  const layer = (
    <>
      <div className="spark-hero-cinematic__wave spark-hero-cinematic__wave--1" />
      <div className="spark-hero-cinematic__wave spark-hero-cinematic__wave--2" />
      <div className="spark-hero-cinematic__wave spark-hero-cinematic__wave--3" />
      <div className="spark-hero-cinematic__mesh" />
    </>
  )

  return (
    <div className="spark-hero-cinematic" aria-hidden>
      {parallax ? (
        <motion.div className="spark-hero-cinematic__layer" style={{ y: bgY }}>
          {layer}
        </motion.div>
      ) : (
        <div className="spark-hero-cinematic__layer">{layer}</div>
      )}
      <div className="spark-hero-cinematic__vignette" />
      <div className="spark-hero-cinematic__grain" />
    </div>
  )
}
