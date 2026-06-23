import type { Metadata } from "next"
import { HomePage } from "@/components/home-page"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const metadata: Metadata = {
  title: {
    default: "Time to Match — Мэтч живёт 24 часа",
    absolute: "Time to Match — 24 hours to connect | Мэтч живёт 24 часа",
  },
  description:
    "Premium dating where every match lives for 24 hours. Connect now or lose them forever. / Премиальное приложение для знакомств — у каждого мэтча 24 часа, чтобы зажечь диалог.",
  alternates: {
    canonical: siteUrl,
    languages: {
      en: siteUrl,
      ru: siteUrl,
    },
  },
  openGraph: {
    title: "Time to Match — 24 hours to connect",
    description:
      "Premium dating where every match lives for 24 hours. Connect now or lose them forever.",
    locale: "en_US",
    alternateLocale: ["ru_RU"],
    images: [
      {
        url: "/brand/ttm-logo-full.png",
        width: 1200,
        height: 630,
        alt: "Time to Match",
      },
    ],
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Time to Match",
      url: siteUrl,
      logo: `${siteUrl.replace(/\/$/, "")}/brand/ttm-logo-full.png`,
    },
    {
      "@type": "WebApplication",
      name: "Time to Match",
      url: siteUrl,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      description:
        "Premium dating app where every mutual match lives for 24 hours — connect now or lose the spark.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomePage />
    </>
  )
}
