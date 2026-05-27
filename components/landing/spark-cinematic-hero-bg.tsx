"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

export function SparkCinematicHeroBg() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 800], [0, reduce ? 0 : 180])

  return (
    <div className="spark-hero-cinematic" aria-hidden>
      <motion.div className="spark-hero-cinematic__layer" style={{ y: bgY }}>
        <div className="spark-hero-cinematic__wave spark-hero-cinematic__wave--1" />
        <div className="spark-hero-cinematic__wave spark-hero-cinematic__wave--2" />
        <div className="spark-hero-cinematic__wave spark-hero-cinematic__wave--3" />
        <div className="spark-hero-cinematic__mesh" />
      </motion.div>
      <div className="spark-hero-cinematic__vignette" />
      <div className="spark-hero-cinematic__grain" />
    </div>
  )
}
