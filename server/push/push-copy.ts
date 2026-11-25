/**
 * Short texts for instant push notifications in the 9 app languages.
 * Message pushes never contain the message text (lock screen privacy); like pushes never name the
 * person (who liked you is a Premium feature in the app).
 */

export type PushKind = "like" | "match" | "message"

const LANGS = ["ru", "uk", "en", "de", "es", "pl", "fr", "it", "tr"] as const
export type PushLang = (typeof LANGS)[number]

const TEXT: Record<PushLang, Record<PushKind, { title: string; body: string }>> = {
  ru: {
    like: { title: "Вам поставили лайк ❤️", body: "Кто-то заинтересовался вами. Загляните в Luvia." },
    match: { title: "Новый мэтч с {name}!", body: "У вас 24 часа, чтобы начать разговор." },
    message: { title: "{name}", body: "Новое сообщение" },
  },
  uk: {
    like: { title: "Вам поставили лайк ❤️", body: "Хтось зацікавився вами. Загляньте в Luvia." },
    match: { title: "Новий метч з {name}!", body: "У вас 24 години, щоб почати розмову." },
    message: { title: "{name}", body: "Нове повідомлення" },
  },
  en: {
    like: { title: "Someone liked you ❤️", body: "Someone is interested in you. Open Luvia to see more." },
    match: { title: "New match with {name}!", body: "You have 24 hours to start the conversation." },
    message: { title: "{name}", body: "New message" },
  },
  de: {
    like: { title: "Jemand mag dich ❤️", body: "Jemand interessiert sich für dich. Schau in Luvia vorbei." },
    match: { title: "Neues Match mit {name}!", body: "Ihr habt 24 Stunden, um das Gespräch zu beginnen." },
    message: { title: "{name}", body: "Neue Nachricht" },
  },
  es: {
    like: { title: "Le gustas a alguien ❤️", body: "Alguien está interesado en ti. Abre Luvia." },
    match: { title: "¡Nuevo match con {name}!", body: "Tenéis 24 horas para empezar a hablar." },
    message: { title: "{name}", body: "Nuevo mensaje" },
  },
  pl: {
    like: { title: "Ktoś Cię polubił ❤️", body: "Ktoś się Tobą zainteresował. Zajrzyj do Luvia." },
    match: { title: "Nowa para z {name}!", body: "Macie 24 godziny, żeby zacząć rozmowę." },
    message: { title: "{name}", body: "Nowa wiadomość" },
  },
  fr: {
    like: { title: "Quelqu'un vous a liké ❤️", body: "Quelqu'un s'intéresse à vous. Ouvrez Luvia." },
    match: { title: "Nouveau match avec {name} !", body: "Vous avez 24 heures pour lancer la conversation." },
    message: { title: "{name}", body: "Nouveau message" },
  },
  it: {
    like: { title: "Piaci a qualcuno ❤️", body: "Qualcuno è interessato a te. Apri Luvia." },
    match: { title: "Nuovo match con {name}!", body: "Avete 24 ore per iniziare a parlare." },
    message: { title: "{name}", body: "Nuovo messaggio" },
  },
  tr: {
    like: { title: "Biri seni beğendi ❤️", body: "Biri seninle ilgileniyor. Luvia'yı aç." },
    match: { title: "{name} ile yeni eşleşme!", body: "Sohbete başlamak için 24 saatiniz var." },
    message: { title: "{name}", body: "Yeni mesaj" },
  },
}

export function pushLang(raw: string | null | undefined): PushLang {
  const l = (raw ?? "").slice(0, 2).toLowerCase()
  return (LANGS as readonly string[]).includes(l) ? (l as PushLang) : "en"
}

export function pushText(kind: PushKind, lang: PushLang, name: string | null): { title: string; body: string } {
  const t = TEXT[lang][kind]
  const who = (name ?? "").trim().split(/\s+/)[0] || "Luvia"
  return { title: t.title.replace("{name}", who), body: t.body.replace("{name}", who) }
}
