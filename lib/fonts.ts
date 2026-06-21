import { DM_Sans, Syne } from "next/font/google"

/** Body copy — clean geometric sans */
export const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
})

/** Display headlines — bold editorial geometric */
export const syne = Syne({
  subsets: ["latin", "latin-ext"],
  variable: "--font-syne",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
})
