import { test, expect } from "@playwright/test"
import de from "@/client/lib/i18n/locales/de.json"
import ru from "@/client/lib/i18n/locales/ru.json"

/**
 * Languages load on demand: the server sends only the page's language with the HTML, and a
 * different saved choice is downloaded and applied in the browser.
 */
test.describe("Lazy language packs", () => {
  test("server language renders at once; a saved other language loads and replaces it", async ({ browser }) => {
    const ctx = await browser.newContext({ locale: "ru-RU" })
    const page = await ctx.newPage()
    // No saved choice: the device language (ru) is server-rendered.
    await page.goto("/login")
    await expect(page.locator("html")).toHaveAttribute("lang", "ru")
    await expect(page.getByRole("button", { name: ru.loginSubmit, exact: true })).toBeVisible()
    // The page carries the Russian texts only, not the other eight languages.
    const html = await page.content()
    expect(html).toContain(ru.appMapEmptyTitle)
    expect(html).not.toContain(de.appMapEmptyTitle)

    // A saved German choice (e.g. from another tab) is applied after its pack downloads.
    await page.evaluate(() => {
      localStorage.setItem("locale", "de")
      document.cookie = "ttm-locale=;path=/;max-age=0"
    })
    await page.context().clearCookies({ name: "ttm-locale" })
    await page.reload()
    await expect(page.locator("html")).toHaveAttribute("lang", "de", { timeout: 15_000 })
    await expect(page.getByRole("button", { name: de.loginSubmit, exact: true })).toBeVisible()
    // ...and remembered for the server, so the next load is German straight away.
    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === "ttm-locale")?.value).toBe("de")
    await page.reload()
    await expect(page.locator("html")).toHaveAttribute("lang", "de")
    await expect(page.getByRole("button", { name: de.loginSubmit, exact: true })).toBeVisible()

    await ctx.close()
  })
})
