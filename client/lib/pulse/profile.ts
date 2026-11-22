import type { Locale } from "@/client/lib/i18n"
import type { SwipeProfile } from "@/client/lib/demo-profiles"
import { PULSE_PROFILE_ID } from "@/client/lib/pulse/constants"

const COPY: Record<Locale, { name: string; bio: string }> = {
  ru: {
    name: "Luvia AI",
    bio: "AI-гид Luvia — помогу с диалогами, идеями для сообщений и настроением связи.",
  },
  uk: {
    name: "Luvia AI",
    bio: "AI-гід Luvia — допоможу з діалогами, ідеями для повідомлень і настроєм зв'язку.",
  },
  en: {
    name: "Luvia AI",
    bio: "Luvia AI guide — here for conversation ideas, tone, and connection rhythm.",
  },
  de: {
    name: "Luvia AI",
    bio: "Luvia KI-Begleiter — für Gesprächsideen und Verbindungsrhythmus.",
  },
  es: {
    name: "Luvia AI",
    bio: "Guía IA de Luvia — ideas de conversación y ritmo de conexión.",
  },
  pl: {
    name: "Luvia AI",
    bio: "AI-przewodnik Luvia — pomysły na rozmowę i rytm relacji.",
  },
  fr: {
    name: "Luvia AI",
    bio: "Guide IA Luvia — idées de messages et rythme de connexion.",
  },
  it: {
    name: "Luvia AI",
    bio: "Guida AI Luvia — idee per i messaggi e il ritmo della connessione.",
  },
  tr: {
    name: "Luvia AI",
    bio: "Luvia AI rehberi — sohbet fikirleri ve bağ ritmi.",
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
