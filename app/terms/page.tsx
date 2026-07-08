"use client"

import Link from "next/link"
import { Navbar } from "@/client/components/navbar"
import { Footer } from "@/client/components/footer"

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-base font-semibold text-white/80 mb-3">{title}</h2>
    <div className="text-sm text-white/45 leading-relaxed space-y-3">{children}</div>
  </div>
)

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[rgba(247,37,133,0.6)] font-medium mb-3">
          Legal
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white/90 mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-white/35 mb-10">Last updated: July 2026</p>

        <Section title="1. Acceptance">
          <p>By creating an account, you agree to these Terms of Service. If you do not agree, do not use Time to Match.</p>
        </Section>

        <Section title="2. Eligibility">
          <p>You must be at least 18 years old to use Time to Match. By registering, you confirm that you meet this requirement.</p>
        </Section>

        <Section title="3. How it works">
          <p>Time to Match is a dating platform where mutual likes create a 24-hour conversation window. After 24 hours, the match expires and the conversation is permanently deleted unless extended using a Match Freeze.</p>
          <p>You are responsible for your own behaviour and communications on the platform.</p>
        </Section>

        <Section title="4. Prohibited conduct">
          <p>You may not: use fake photos or impersonate other people, harass, threaten, or abuse other users, share explicit content without consent, create multiple accounts, use the platform for commercial solicitation, use automated tools to swipe or message.</p>
          <p>Violations may result in immediate account suspension.</p>
        </Section>

        <Section title="5. Premium subscriptions">
          <p>Premium and VIP plans are billed monthly. You may cancel at any time from your account settings. Refunds are not provided for partial billing periods. Stripe processes all payments — we do not store your card details.</p>
        </Section>

        <Section title="6. Content">
          <p>You retain ownership of content you post. By posting, you grant Time to Match a licence to display it within the platform. We may remove content that violates these Terms.</p>
        </Section>

        <Section title="7. Limitation of liability">
          <p>Time to Match is provided as-is. We are not responsible for the conduct of users, for matches that do not result in relationships, or for any indirect damages arising from use of the platform.</p>
        </Section>

        <Section title="8. Changes">
          <p>We may update these Terms. Continued use after changes constitutes acceptance. Material changes will be notified by email.</p>
        </Section>

        <Section title="9. Contact">
          <p>For legal matters: <a href="mailto:legal@timetomatch.app" className="text-[rgba(247,37,133,0.7)] hover:text-[rgba(247,37,133,0.9)]">legal@timetomatch.app</a></p>
        </Section>

        <p className="mt-10">
          <Link href="/" className="text-sm text-white/30 hover:text-white/60 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
      <Footer />
    </main>
  )
}
