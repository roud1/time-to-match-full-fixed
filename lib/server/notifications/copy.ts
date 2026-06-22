import type { NotificationDeliveryContent, NotificationType } from "@/lib/server/notifications/types"
import { discoverIdToNumeric } from "@/lib/discover/map-profile"

function chatHref(origin: string, peerUserId: string | null): string {
  if (!peerUserId) return `${origin}/app?tab=chat`
  return `${origin}/app?tab=chat&with=${discoverIdToNumeric(peerUserId)}`
}

export function buildNotificationContent(input: {
  type: NotificationType
  leadHours: number
  peerName: string | null
  referenceId: string | null
  appOrigin: string
}): NotificationDeliveryContent {
  const { type, leadHours, peerName, referenceId, appOrigin } = input
  const origin = appOrigin.replace(/\/$/, "")

  if (type === "profile_expiring") {
    const href = `${origin}/profile`
    const title = "Твоя анкета скоро исчезнет — успей создать момент"
    const body =
      leadHours === 12
        ? "Твоя анкета тает, как утренний туман. Осталось полдня — продли, пока тебя ещё видят."
        : leadHours === 6
          ? "Всего 6 часов, чтобы найти отклик. Время утекает — открой профиль."
          : leadHours === 1
            ? "Последний час. Потом анкета исчезнет, как сон. Успей перевернуть часы."
            : `До конца срока анкеты осталось около ${leadHours} ч. Продли, чтобы оставаться в ленте.`
    return {
      title,
      body,
      href,
      tag: `profile-expiry-${leadHours}`,
      html: `<p>${body}</p><p><a href="${href}">Открыть профиль</a></p>`,
    }
  }

  const name = peerName ?? "собеседником"
  const href = chatHref(origin, referenceId)

  if (type === "new_match") {
    const title = `Новый мэтч с ${name === "собеседником" ? "собеседником" : name}!`
    const body = "У вас 24 часа, чтобы зажечь диалог. Напишите первым."
    return {
      title,
      body,
      href,
      tag: `new-match-${referenceId ?? "unknown"}`,
      html: `<p>${body}</p><p><a href="${href}">Открыть чат</a></p>`,
    }
  }

  if (type === "match_urgency_warning") {
    const title =
      leadHours <= 1
        ? `Последний час с ${name}`
        : `Время уходит — ${name} ждёт ответа`
    const body =
      leadHours <= 1
        ? `Остался час, чтобы не потерять мэтч с ${name}. Ответь сейчас.`
        : `Прошло 12 часов без ответа. Мэтч с ${name} скоро исчезнет — напиши первым.`
    return {
      title,
      body,
      href,
      tag: `match-urgency-${referenceId ?? "unknown"}-${leadHours}`,
      html: `<p>${body}</p><p><a href="${href}">Открыть чат</a></p>`,
    }
  }

  const title = `Мэтч с ${name === "собеседником" ? "собеседником" : name} догорает. Сохрани его`
  const body =
    leadHours === 6
      ? `Мэтч с ${name} на грани. Шесть часов до темноты — загляни в чат.`
      : leadHours === 1
        ? `Остался час, чтобы не потерять ${name}. Заморозь мгновение или напиши прямо сейчас.`
        : `Связь с ${name} закончится примерно через ${leadHours} ч. Загляните в чат, пока пламя живо.`
  return {
    title,
    body,
    href,
    tag: `match-expiry-${referenceId ?? "unknown"}-${leadHours}`,
    html: `<p>${body}</p><p><a href="${href}">Открыть чат</a></p>`,
  }
}
