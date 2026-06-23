import type { NotificationDeliveryContent, NotificationType } from "@/server/notifications/types"
import { discoverIdToNumeric } from "@/client/lib/discover/map-profile"

export type NotificationLocale = "ru" | "en"

function chatHref(origin: string, peerUserId: string | null): string {
  if (!peerUserId) return `${origin}/app?tab=chat`
  return `${origin}/app?tab=chat&with=${discoverIdToNumeric(peerUserId)}`
}

const COPY: Record<
  NotificationLocale,
  {
    profileExpiring: (leadHours: number) => { title: string; body: string }
    newMatch: (name: string) => { title: string; body: string }
    matchUrgency: (name: string, leadHours: number) => { title: string; body: string }
    matchExpiring: (name: string, leadHours: number) => { title: string; body: string }
    peerFallback: string
    openProfile: string
    openChat: string
  }
> = {
  ru: {
    peerFallback: "собеседником",
    openProfile: "Открыть профиль",
    openChat: "Открыть чат",
    profileExpiring: (leadHours) => {
      if (leadHours === 12) {
        return {
          title: "Твоя анкета скоро исчезнет — успей создать момент",
          body: "Твоя анкета тает, как утренний туман. Осталось полдня — продли, пока тебя ещё видят.",
        }
      }
      if (leadHours === 6) {
        return {
          title: "Твоя анкета скоро исчезнет — успей создать момент",
          body: "Всего 6 часов, чтобы найти отклик. Время утекает — открой профиль.",
        }
      }
      if (leadHours === 1) {
        return {
          title: "Последний час для твоей анкеты",
          body: "Последний час. Потом анкета исчезнет, как сон. Успей перевернуть часы.",
        }
      }
      return {
        title: "Твоя анкета скоро исчезнет",
        body: `До конца срока анкеты осталось около ${leadHours} ч. Продли, чтобы оставаться в ленте.`,
      }
    },
    newMatch: (name) => ({
      title: `Новый мэтч с ${name}!`,
      body: "У вас 24 часа, чтобы зажечь диалог. Напишите первым.",
    }),
    matchUrgency: (name, leadHours) =>
      leadHours <= 1
        ? {
            title: `Последний час с ${name}`,
            body: `Остался час, чтобы не потерять мэтч с ${name}. Ответь сейчас.`,
          }
        : {
            title: `Время уходит — ${name} ждёт ответа`,
            body: `Прошло 12 часов без ответа. Мэтч с ${name} скоро исчезнет — напиши первым.`,
          },
    matchExpiring: (name, leadHours) => {
      if (leadHours === 6) {
        return {
          title: `Мэтч с ${name} догорает`,
          body: `Мэтч с ${name} на грани. Шесть часов до темноты — загляни в чат.`,
        }
      }
      if (leadHours === 1) {
        return {
          title: `Последний час с ${name}`,
          body: `Остался час, чтобы не потерять ${name}. Заморозь мгновение или напиши прямо сейчас.`,
        }
      }
      return {
        title: `Мэтч с ${name} догорает. Сохрани его`,
        body: `Связь с ${name} закончится примерно через ${leadHours} ч. Загляните в чат, пока пламя живо.`,
      }
    },
  },
  en: {
    peerFallback: "your match",
    openProfile: "Open profile",
    openChat: "Open chat",
    profileExpiring: (leadHours) => {
      if (leadHours === 12) {
        return {
          title: "Your profile fades soon — make the moment count",
          body: "Your profile is melting away like morning mist. Half a day left — extend it while you're still visible.",
        }
      }
      if (leadHours === 6) {
        return {
          title: "Your profile fades soon — make the moment count",
          body: "Only 6 hours left to get a response. Time is slipping — open your profile.",
        }
      }
      if (leadHours === 1) {
        return {
          title: "Last hour for your profile",
          body: "One hour left. Then your profile vanishes like a dream. Extend it now.",
        }
      }
      return {
        title: "Your profile is expiring soon",
        body: `About ${leadHours}h left on your profile. Extend it to stay in the feed.`,
      }
    },
    newMatch: (name) => ({
      title: `New match with ${name}!`,
      body: "You have 24 hours to spark a conversation. Send the first message.",
    }),
    matchUrgency: (name, leadHours) =>
      leadHours <= 1
        ? {
            title: `Last hour with ${name}`,
            body: `One hour left to save your match with ${name}. Reply now.`,
          }
        : {
            title: `Time is running out — ${name} is waiting`,
            body: `12 hours without a reply. Your match with ${name} is about to expire — message first.`,
          },
    matchExpiring: (name, leadHours) => {
      if (leadHours === 6) {
        return {
          title: `Match with ${name} is fading`,
          body: `Your match with ${name} is on the edge. Six hours left — open the chat.`,
        }
      }
      if (leadHours === 1) {
        return {
          title: `Last hour with ${name}`,
          body: `One hour left to keep ${name}. Freeze the moment or message right now.`,
        }
      }
      return {
        title: `Save your match with ${name}`,
        body: `Your connection with ${name} ends in about ${leadHours}h. Open chat while the spark is alive.`,
      }
    },
  },
}

export function resolveNotificationLocale(): NotificationLocale {
  const raw = process.env.NOTIFICATION_LOCALE ?? process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "ru"
  return raw.startsWith("en") ? "en" : "ru"
}

export function buildNotificationContent(input: {
  type: NotificationType
  leadHours: number
  peerName: string | null
  referenceId: string | null
  appOrigin: string
  locale?: NotificationLocale
}): NotificationDeliveryContent {
  const { type, leadHours, peerName, referenceId, appOrigin } = input
  const locale = input.locale ?? resolveNotificationLocale()
  const strings = COPY[locale]
  const origin = appOrigin.replace(/\/$/, "")

  if (type === "profile_expiring") {
    const href = `${origin}/profile`
    const { title, body } = strings.profileExpiring(leadHours)
    return {
      title,
      body,
      href,
      tag: `profile-expiry-${leadHours}`,
      html: `<p>${body}</p><p><a href="${href}">${strings.openProfile}</a></p>`,
    }
  }

  const name = peerName ?? strings.peerFallback
  const href = chatHref(origin, referenceId)

  if (type === "new_match") {
    const { title, body } = strings.newMatch(name)
    return {
      title,
      body,
      href,
      tag: `new-match-${referenceId ?? "unknown"}`,
      html: `<p>${body}</p><p><a href="${href}">${strings.openChat}</a></p>`,
    }
  }

  if (type === "match_urgency_warning") {
    const { title, body } = strings.matchUrgency(name, leadHours)
    return {
      title,
      body,
      href,
      tag: `match-urgency-${referenceId ?? "unknown"}-${leadHours}`,
      html: `<p>${body}</p><p><a href="${href}">${strings.openChat}</a></p>`,
    }
  }

  const { title, body } = strings.matchExpiring(name, leadHours)
  return {
    title,
    body,
    href,
    tag: `match-expiry-${referenceId ?? "unknown"}-${leadHours}`,
    html: `<p>${body}</p><p><a href="${href}">${strings.openChat}</a></p>`,
  }
}
