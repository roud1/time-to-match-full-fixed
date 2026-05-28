"use client"

import { useReducedMotion } from "motion/react"
import { useEffect, useRef } from "react"

const NODE_COUNT = 42
const LINK_DIST = 0.22
const PINK = { r: 236, g: 72, b: 153 }
const BLUE = { r: 56, g: 189, b: 248 }

type Node = {
  x: number
  y: number
  vx: number
  vy: number
  pulse: number
  pulseSpeed: number
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function AiNeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const nodes: Node[] = []

    const initNodes = () => {
      nodes.length = 0
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random(),
          y: Math.random(),
          vx: (Math.random() - 0.5) * 0.00035,
          vy: (Math.random() - 0.5) * 0.00035,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.008 + Math.random() * 0.012,
        })
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (nodes.length === 0) initNodes()
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        n.pulse += n.pulseSpeed
        if (n.x < 0.04 || n.x > 0.96) n.vx *= -1
        if (n.y < 0.04 || n.y > 0.96) n.vy *= -1
      }

      const maxDist = Math.hypot(w, h) * LINK_DIST

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const ax = a.x * w
          const ay = a.y * h
          const bx = b.x * w
          const by = b.y * h
          const dist = Math.hypot(ax - bx, ay - by)
          if (dist > maxDist) continue

          const t = 1 - dist / maxDist
          const pulse = (Math.sin(a.pulse) + Math.sin(b.pulse)) * 0.5 + 0.5
          const alpha = t * 0.22 * (0.4 + pulse * 0.6)

          const grad = ctx.createLinearGradient(ax, ay, bx, by)
          grad.addColorStop(0, `rgba(${BLUE.r},${BLUE.g},${BLUE.b},${alpha})`)
          grad.addColorStop(0.5, `rgba(${lerp(BLUE.r, PINK.r, 0.5)},${lerp(BLUE.g, PINK.g, 0.5)},${lerp(BLUE.b, PINK.b, 0.5)},${alpha * 1.1})`)
          grad.addColorStop(1, `rgba(${PINK.r},${PINK.g},${PINK.b},${alpha})`)

          ctx.beginPath()
          ctx.strokeStyle = grad
          ctx.lineWidth = 0.6 + t * 0.8
          ctx.moveTo(ax, ay)
          ctx.lineTo(bx, by)
          ctx.stroke()
        }
      }

      for (const n of nodes) {
        const x = n.x * w
        const y = n.y * h
        const glow = (Math.sin(n.pulse) + 1) * 0.5
        const r = 1.8 + glow * 1.4

        const nodeGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 8)
        nodeGrad.addColorStop(0, `rgba(${BLUE.r},${BLUE.g},${BLUE.b},${0.35 + glow * 0.25})`)
        nodeGrad.addColorStop(0.4, `rgba(${PINK.r},${PINK.g},${PINK.b},${0.15 + glow * 0.15})`)
        nodeGrad.addColorStop(1, "rgba(10,10,13,0)")

        ctx.fillStyle = nodeGrad
        ctx.beginPath()
        ctx.arc(x, y, r * 8, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `rgba(255,255,255,${0.55 + glow * 0.35})`
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener("resize", resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [reduce])

  if (reduce) {
    return (
      <div className="ttm-ai-neural ttm-ai-neural--static" aria-hidden>
        <div className="ttm-ai-neural__fallback" />
      </div>
    )
  }

  return <canvas ref={canvasRef} className="ttm-ai-neural" aria-hidden />
}
