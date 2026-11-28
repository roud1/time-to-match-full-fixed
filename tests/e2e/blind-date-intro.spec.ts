import { test, expect, request as playwrightRequest } from "@playwright/test"
import { createTestUser, markEmailVerified, registerUserViaApi } from "./helpers/test-user"
import { ROOM_DURATION_MS } from "@/server/blind-date/rules"
import ru from "@/client/lib/i18n/locales/ru.json"

/** The intro screen states the same date length the server uses (it said 10 minutes vs 30). */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"

test.describe("Blind date intro @db", () => {
  test("duration in the texts matches the server rule", async ({ browser }) => {
    const api = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
    const ready = (await (await api.get("/api/ready")).json()) as { mode?: string; database?: string }
    test.skip(ready.mode !== "production" || ready.database !== "ok", "Requires Postgres")
    const user = await registerUserViaApi(api, createTestUser("bdi"))
    await markEmailVerified(user.email)
    const ctx = await browser.newContext({ storageState: await api.storageState(), locale: "ru-RU", baseURL })
    await ctx.addInitScript(() => localStorage.setItem("locale", "ru"))
    const page = await ctx.newPage()
    await page.goto("/app/blind-date")
    const minutes = Math.round(ROOM_DURATION_MS / 60_000)
    const intro = ru.bdIntro.replace("{minutes}", String(minutes))
    const rule = ru.bdRule1.replace("{minutes}", String(minutes))
    await expect(page.getByText(intro)).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(rule)).toBeVisible()
    await expect(page.locator("body")).not.toContainText("{minutes}")
    await expect(page.locator("body")).not.toContainText("10 минут")
    await ctx.close()
    await api.dispose()
  })
})
