"use client"

import { motion, useReducedMotion } from "motion/react"
import { useCallback, useEffect, useState } from "react"
import { demoConnectionScore } from "@/lib/landing/demo-connection-score"
import { cn } from "@/lib/utils"

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active || target <= 0) {
      setValue(0)
      return
    }

    let start: number | null = null
    let raf = 0

    const tick = (ts: number) => {
      if (start === null) start = ts
      const t = Math.min(1, (ts - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, duration])

  return value
}

export function AiLiveDemoSection() {
  const reduce = useReducedMotion()
  const [yourName, setYourName] = useState("")
  const [theirName, setTheirName] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [resultScore, setResultScore] = useState<number | null>(null)
  const displayScore = useCountUp(resultScore ?? 0, resultScore !== null && !analyzing)

  const runAnalysis = useCallback(() => {
    const a = yourName.trim()
    const b = theirName.trim()
    if (!a || !b) return

    setAnalyzing(true)
    setResultScore(null)

    window.setTimeout(() => {
      setResultScore(demoConnectionScore(a, b))
      setAnalyzing(false)
    }, 1400)
  }, [yourName, theirName])

  const canAnalyze = yourName.trim().length > 0 && theirName.trim().length > 0

  return (
    <section id="demo" className="ttm-ai-section ttm-ai-demo" aria-labelledby="ai-demo-title">
      <div className="ttm-ai-container">
        <motion.p
          className="ttm-ai-section__eyebrow"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Live demo
        </motion.p>
        <motion.h2
          id="ai-demo-title"
          className="ttm-ai-section__title"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Preview your connection signal
        </motion.h2>

        <motion.div
          className="ttm-ai-demo__card"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ttm-ai-demo__fields">
            <label className="ttm-ai-demo__field">
              <span className="ttm-ai-demo__label">Your name</span>
              <input
                type="text"
                className="ttm-ai-demo__input"
                placeholder="Alex"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                autoComplete="given-name"
              />
            </label>
            <label className="ttm-ai-demo__field">
              <span className="ttm-ai-demo__label">Their name</span>
              <input
                type="text"
                className="ttm-ai-demo__input"
                placeholder="Jordan"
                value={theirName}
                onChange={(e) => setTheirName(e.target.value)}
                autoComplete="off"
              />
            </label>
          </div>

          <button
            type="button"
            className="ttm-ai-demo__analyze"
            disabled={!canAnalyze || analyzing}
            onClick={runAnalysis}
          >
            {analyzing ? "Analyzing…" : "Analyze"}
          </button>

          <div
            className={cn(
              "ttm-ai-demo__result",
              (analyzing || resultScore !== null) && "ttm-ai-demo__result--visible"
            )}
            aria-live="polite"
          >
            {analyzing && (
              <p className="ttm-ai-demo__result-loading">
                <span className="ttm-ai-demo__pulse-dot" aria-hidden />
                Mapping behavioral overlap…
              </p>
            )}
            {!analyzing && resultScore !== null && (
              <>
                <p className="ttm-ai-demo__result-label">Connection score</p>
                <p className="ttm-ai-demo__result-value">{displayScore}%</p>
                <p className="ttm-ai-demo__result-hint">
                  Demo preview — real scores update as you connect in the app.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
