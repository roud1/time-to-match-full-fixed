import type { Metadata, Viewport } from "next"
import { fontBody, fontDisplay, fontLandingBody } from "@/client/lib/fonts"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { I18nProvider } from "@/client/lib/i18n"
import { QueryProvider } from "@/client/components/providers/query-provider"
import { SiteBackground } from "@/client/components/site-background"
import { MobileScreenTransition } from "@/client/components/mobile/mobile-screen-transition"
import { ServiceWorkerRegister } from "@/client/components/pwa/service-worker-register"
import { PushSubscriptionBootstrap } from "@/client/components/pwa/push-subscription-bootstrap"
import { FloatingChrome } from "@/client/components/floating-chrome"
import { ThemeProvider } from "@/client/components/theme/theme-provider"
import { ThemeScript } from "@/client/components/theme/theme-script"
import { Toaster } from "@/client/components/ui/sonner"
import { AchievementProvider } from "@/client/components/gamification/achievement-provider"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Time to Match",
  title: {
    default: "Time to Match — Мэтч живёт 24 часа",
    template: "%s · Time to Match",
  },
  description:
    "Премиальное приложение для знакомств. У каждого мэтча — 24 часа, чтобы зажечь диалог.",
  keywords: [
    "знакомства",
    "dating",
    "премиум",
    "24 часа",
    "Time to Match",
    "match",
    "отношения",
  ],
  authors: [{ name: "Time to Match" }],
  creator: "Time to Match",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "Time to Match",
    title: "Time to Match — Мэтч живёт 24 часа",
    description:
      "Премиальное приложение для знакомств. У каждого мэтча — 24 часа, чтобы зажечь диалог.",
    images: [
      {
        url: "/brand/ttm-logo-full.png",
        width: 1200,
        height: 630,
        alt: "Time to Match",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Time to Match — Мэтч живёт 24 часа",
    description:
      "Премиальное приложение для знакомств. У каждого мэтча — 24 часа, чтобы зажечь диалог.",
    images: ["/brand/ttm-logo-full.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Time to Match",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#0B0F14",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="bg-transparent">
      <head>
        <meta name="color-scheme" content="light dark" />
        <ThemeScript />
      </head>
      <body
        className={`${fontBody.variable} ${fontDisplay.variable} ${fontLandingBody.variable} font-sans antialiased ttm-root ttm-brand-universe`}
      >
        <ThemeProvider>
          <I18nProvider>
            <QueryProvider>
              <AchievementProvider>
                <ServiceWorkerRegister />
                <PushSubscriptionBootstrap />
                <SiteBackground />
                <MobileScreenTransition>
                  <div className="relative z-0 min-h-screen">{children}</div>
                </MobileScreenTransition>
                <FloatingChrome />
                <Toaster position="top-center" richColors closeButton />
              </AchievementProvider>
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  )
}
