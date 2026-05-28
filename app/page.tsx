import type { Metadata } from "next"
import { HomePage } from "@/components/home-page"

export const metadata: Metadata = {
  title: "Time to Match — 24 hours to connect",
  description:
    "Premium dating where every match lives for 24 hours. Connect now or lose them forever.",
  openGraph: {
    title: "Time to Match — 24 hours to connect",
    description:
      "Premium dating where every match lives for 24 hours. Connect now or lose them forever.",
  },
}

export default function Home() {
  return <HomePage />
}
