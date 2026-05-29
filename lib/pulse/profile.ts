import type { Locale } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { PULSE_PROFILE_ID } from "@/lib/pulse/constants"

const COPY: Record<Locale, { name: string; bio: string }> = {
  ru: {
    name: "Pulse",
    bio: "AI-гид Time to Match — помогу с диалогами, идеями для сообщений и настроением связи.",
  },
  uk: {
    name: "Pulse",
    bio: "AI-гід Time to Match — допоможу з діалогами, ідеями для повідомлень і настроєм зв'язку.",
  },
  en: {
    name: "Pulse",
    bio: "Time to Match AI guide — here for conversation ideas, tone, and connection rhythm.",
  },
  de: {
    name: "Pulse",
    bio: "Time to Match KI-Begleiter — für Gesprächsideen und Verbindungsrhythmus.",
  },
  es: {
    name: "Pulse",
    bio: "Guía IA de Time to Match — ideas de conversación y ritmo de conexión.",
  },
  pl: {
    name: "Pulse",
    bio: "AI-przewodnik Time to Match — pomysły na rozmowę i rytm relacji.",
  },
  fr: {
    name: "Pulse",
    bio: "Guide IA Time to Match — idées de messages et rythme de connexion.",
  },
  it: {
    name: "Pulse",
    bio: "Guida AI Time to Match — idee per i messaggi e il ritmo della connessione.",
  },
  tr: {
    name: "Pulse",
    bio: "Time to Match AI rehberi — sohbet fikirleri ve bağ ritmi.",
  },
}

export function getPulseProfile(locale: Locale): SwipeProfile {
  const copy = COPY[locale] ?? COPY.en
  return {
    id: PULSE_PROFILE_ID,
    name: copy.name,
    age: 0,
    gender: "female",
    location: "AI",
    distance: "",
    image: "/images/pulse-avatar.svg",
    images: ["/images/pulse-avatar.svg"],
    timeLeft: "—",
    bio: copy.bio,
    about: copy.bio,
    interests: [],
    lat: 0,
    lng: 0,
  }
}
