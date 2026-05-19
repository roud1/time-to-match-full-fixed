import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { I18nProvider } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { SiteBackground } from '@/components/site-background'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Time to Match — У тебя всего 72 часа',
  description: 'Премиальное приложение для знакомств. Каждый профиль исчезает через 72 часа. Не упусти свой шанс.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
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
    <html lang="ru" suppressHydrationWarning className="bg-[#06060a]">
      <body className={`${inter.variable} font-sans antialiased`}>
        <I18nProvider>
          <SiteBackground />
          <div className="relative z-0 min-h-screen">
            {children}
          </div>
          <LanguageSwitcher />
        </I18nProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
