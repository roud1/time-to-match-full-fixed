import type { Metadata, Viewport } from "next"
import { Inter_Tight } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { I18nProvider } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import { SiteBackground } from "@/components/site-background"

const interTight = Inter_Tight({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter-tight",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500"],
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Time to Match",
  title: {
    default: "Time to Match — У тебя всего 72 часа",
    template: "%s · Time to Match",
  },
  description:
    "Премиальное приложение для знакомств. Каждый профиль исчезает через 72 часа. Не упусти свой шанс.",
  keywords: [
    "знакомства",
    "dating",
    "премиум",
    "72 часа",
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
    title: "Time to Match — У тебя всего 72 часа",
    description:
      "Премиальное приложение для знакомств. Каждый профиль исчезает через 72 часа. Не упусти свой шанс.",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Time to Match",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Time to Match — У тебя всего 72 часа",
    description:
      "Премиальное приложение для знакомств. Каждый профиль исчезает через 72 часа. Не упусти свой шанс.",
    images: ["/icon.svg"],
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
  themeColor: "#050506",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="bg-[#050506]">
      <body className={`${interTight.variable} font-sans antialiased ttm-root`}>
        <I18nProvider>
          <SiteBackground />
          <div className="relative z-0 min-h-screen">
            {children}
          </div>
          <LanguageSwitcher />
        </I18nProvider>
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
