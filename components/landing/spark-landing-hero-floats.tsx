"use client"

import Image from "next/image"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const FLOAT_CARDS = [
  {
    name: "Анна",
    age: 24,
    pct: 82,
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=280&h=360&fit=crop&q=80",
    className: "spark-hero-float--left",
    delay: "0s",
  },
  {
    name: "Максим",
    age: 27,
    pct: 65,
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=280&h=360&fit=crop&q=80",
    className: "spark-hero-float--right",
    delay: "-2s",
  },
  {
    name: "Ева",
    age: 22,
    pct: 91,
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=280&h=360&fit=crop&q=80",
    className: "spark-hero-float--back",
    delay: "-4s",
  },
] as const

export function SparkLandingHeroFloats() {
  const reduce = useReducedMotion()

  return (
    <div className="spark-hero-floats" aria-hidden>
      {FLOAT_CARDS.map((card) => (
        <div
          key={card.name}
          className={cn(
            "spark-hero-float",
            card.className,
            !reduce && "spark-hero-float--animate"
          )}
          style={{ animationDelay: card.delay }}
        >
          <div className="spark-hero-float__photo">
            <Image
              src={card.imageUrl}
              alt=""
              fill
              className="object-cover object-[center_20%]"
              sizes="140px"
              draggable={false}
            />
            <div className="spark-hero-float__shade" />
          </div>
          <div className="spark-hero-float__meta">
            <span className="spark-hero-float__name">
              {card.name}, {card.age}
            </span>
            <span className="spark-hero-float__pct">{card.pct}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}
