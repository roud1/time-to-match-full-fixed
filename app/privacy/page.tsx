"use client"

import Link from "next/link"
import { Navbar } from "@/client/components/navbar"
import { Footer } from "@/client/components/footer"
import { useI18n } from "@/client/lib/i18n"

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-base font-semibold text-white/80 mb-3">{title}</h2>
    <div className="text-sm text-white/45 leading-relaxed space-y-3">{children}</div>
  </div>
)

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[rgba(247,37,133,0.6)] font-medium mb-3">
          Legal
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white/90 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-white/35 mb-10">Last updated: July 2026</p>

        <Section title="1. What we collect">
          <p>When you register, we collect your name, email address, and password (stored as a one-way hash). When you use the app, we collect the profile information you provide (photos, bio, interests, location preference, age).</p>
          <p>We do not sell your data. We do not share your data with advertisers.</p>
        </Section>

        <Section title="2. How we use your data">
          <p>We use your data to: show your profile to potential matches, facilitate connections and chat, send transactional emails (email verification, match notifications, expiry reminders), and detect and prevent abuse.</p>
          <p>We use Sentry for error monitoring (anonymised stack traces only), Stripe for payment processing, and Pusher for real-time chat delivery.</p>
        </Section>

        <Section title="3. Data retention">
          <p>Your data is stored for as long as your account exists. When you delete your account, all your data is permanently deleted within 30 days — including your profile, photos, matches, and messages.</p>
          <p>Expired match conversations are deleted automatically after 24 hours per our core product mechanic.</p>
        </Section>

        <Section title="4. Your rights (GDPR)">
          <p>If you are in the EU/EEA, you have the right to: access your data, correct inaccurate data, delete your account and all associated data, export your data, and withdraw consent at any time.</p>
          <p>To exercise these rights, go to Settings → Account → Delete Account, or contact us at privacy@timetomatch.app.</p>
        </Section>

        <Section title="5. Cookies">
          <p>We use a single session cookie for authentication. We do not use tracking cookies or third-party advertising cookies.</p>
        </Section>

        <Section title="6. Contact">
          <p>For privacy questions: <a href="mailto:privacy@timetomatch.app" className="text-[rgba(247,37,133,0.7)] hover:text-[rgba(247,37,133,0.9)]">privacy@timetomatch.app</a></p>
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
