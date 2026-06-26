"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { BenefitsSection } from "@/client/components/landing/benefits-section"
import { ChatPreviewSection } from "@/client/components/landing/chat-preview-section"
import { FinalCtaSection } from "@/client/components/landing/final-cta-section"
import { HeroSection } from "@/client/components/landing/hero-section"
import { HowItWorksSection } from "@/client/components/landing/how-it-works-section"
import { ProblemSection } from "@/client/components/landing/problem-section"
import { SolutionSection } from "@/client/components/landing/solution-section"
import { Logo } from "@/client/components/logo"
import { fontLandingBody, fontLandingDisplay } from "@/client/lib/fonts"
import { isLoggedIn } from "@/client/lib/user-profile"
import { cn } from "@/client/lib/utils"
import "@/client/styles/landing.css"

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "Solution" },
  { href: "#chat", label: "Chat" },
  { href: "#benefits", label: "Benefits" },
] as const

export function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sync = () => setLoggedIn(isLoggedIn())
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener("ttm-user-profile-changed", sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("ttm-user-profile-changed", sync)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <main className={cn(fontLandingDisplay.variable, fontLandingBody.variable, "ttm-landing")}>
      <div className="ttm-landing__ambient" aria-hidden>
        <div className="ttm-landing__orb ttm-landing__orb--pink" />
        <div className="ttm-landing__orb ttm-landing__orb--purple" />
        <div className="ttm-landing__grid-noise" />
      </div>

      <motion.header
        className={cn("ttm-landing-nav", scrolled && "ttm-landing-nav--scrolled")}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ttm-landing-container ttm-landing-nav__inner">
          <Link href="/" aria-label="Time to Match home">
            <Logo variant="wordmark" size="sm" theme="dark" />
          </Link>

          <div className="ttm-landing-nav__links">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="ttm-landing-nav__link">
                {link.label}
              </a>
            ))}
          </div>

          <div className="ttm-landing-nav__actions">
            {loggedIn ? (
              <Link href="/app" className="ttm-landing-btn ttm-landing-btn--primary">
                Open app
              </Link>
            ) : (
              <>
                <Link href="/login" className="ttm-landing-btn ttm-landing-btn--ghost">
                  Log in
                </Link>
                <Link href="/register" className="ttm-landing-btn ttm-landing-btn--primary">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <HeroSection />
      <HowItWorksSection />
      <ProblemSection />
      <SolutionSection />
      <ChatPreviewSection />
      <BenefitsSection />
      <FinalCtaSection />

      <footer className="ttm-landing-footer">
        <div className="ttm-landing-container ttm-landing-footer__inner">
          <p className="ttm-landing-footer__copy">
            © {new Date().getFullYear()} Time to Match. All rights reserved.
          </p>
          <div className="ttm-landing-footer__links">
            <Link href="/login" className="ttm-landing-footer__link">
              Log in
            </Link>
            <Link href="/register" className="ttm-landing-footer__link">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
