import { Inter, Manrope } from "next/font/google"

export const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
  weight: ["200", "300", "400", "500"],
})

/** Premium landing — Inter / SF Pro–style headlines */
export const interDisplay = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})
