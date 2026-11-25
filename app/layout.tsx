import "@/client/components/app-mode/app-mode.css"
import { AppModeSync } from "@/client/components/app-mode/app-mode-sync"
import { AndroidBackHandler } from "@/client/components/app-mode/android-back-handler"
import type { Metadata, Viewport } from "next"
import { headers } from "next/headers"
import { fontBody, fontDisplay, fontLandingBody } from "@/client/lib/fonts"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { I18nProvider } from "@/client/lib/i18n"
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/client/lib/i18n/config"
import { QueryProvider } from "@/client/components/providers/query-provider"
import { SiteBackground } from "@/client/components/site-background"
import { MobileScreenTransition } from "@/client/components/mobile/mobile-screen-transition"
import { ServiceWorkerRegister } from "@/client/components/pwa/service-worker-register"
import { PushSubscriptionBootstrap } from "@/client/components/pwa/push-subscription-bootstrap"
import { NativePushBootstrap } from "@/client/components/pwa/native-push-bootstrap"
import { FloatingChrome } from "@/client/components/floating-chrome"
import { ThemeProvider } from "@/client/components/theme/theme-provider"
import { ThemeScript } from "@/client/components/theme/theme-script"
import { Toaster } from "@/client/components/ui/sonner"
import { AdSenseScript } from "@/client/components/ads/adsense-script"
import { AchievementProvider } from "@/client/components/gamification/achievement-provider"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Luvia",
  title: {
    default: "Luvia — Мэтч живёт 24 часа",
    template: "%s · Luvia",
  },
  description:
    "Премиальное приложение для знакомств. У каждого мэтча — 24 часа, чтобы зажечь диалог.",
  keywords: ["знакомства", "dating", "премиум", "24 часа", "Luvia", "match", "отношения"],
  authors: [{ name: "Luvia" }],
  creator: "Luvia",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "Luvia",
    title: "Luvia — Мэтч живёт 24 часа",
    description:
      "Премиальное приложение для знакомств. У каждого мэтча — 24 часа, чтобы зажечь диалог.",
    images: [
      {
        url: "/brand/ttm-logo-full.png",
        width: 1200,
        height: 630,
        alt: "Luvia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luvia — Мэтч живёт 24 часа",
    description:
      "Премиальное приложение для знакомств. У каждого мэтча — 24 часа, чтобы зажечь диалог.",
    images: ["/brand/ttm-logo-full.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Luvia",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#0d0a17",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Read locale from middleware-forwarded header (set from ttm-locale cookie)
  const headersList = await headers()
  const localeHeader = headersList.get("x-locale")
  const lang: Locale = localeHeader && isLocale(localeHeader) ? localeHeader : DEFAULT_LOCALE

  return (
    <html lang={lang} suppressHydrationWarning className="bg-transparent" data-lv="1">
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var d=document.documentElement;if(/TTMApp/.test(navigator.userAgent||"")||navigator.standalone===true||(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)){d.setAttribute("data-ttm-app","1")}}catch(e){}})();',
          }}
        />
        <ThemeScript />
        <AdSenseScript />
      </head>
      <body
        className={`${fontBody.variable} ${fontDisplay.variable} ${fontLandingBody.variable} font-sans antialiased ttm-root ttm-brand-universe`}
      >
        <ThemeProvider>
          <AppModeSync />
          <AndroidBackHandler />
          <I18nProvider initialLocale={lang}>
            <QueryProvider>
              <AchievementProvider>
                <ServiceWorkerRegister />
                <PushSubscriptionBootstrap />
                <NativePushBootstrap />
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
