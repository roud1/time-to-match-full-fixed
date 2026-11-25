import { test, expect } from "@playwright/test"

/** Settings → Appearance: stored choice is applied before the first paint, "system" follows the OS. */
test.describe("Light / dark appearance", () => {
  test("default is dark", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator("html")).toHaveAttribute("data-lv-theme", "dark")
  })

  test("stored light theme applies on load, recolours the page and the browser bar", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("lv-theme", "light"))
    await page.goto("/login")
    await expect(page.locator("html")).toHaveAttribute("data-lv-theme", "light")
    const bg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)
    expect(bg).toBe("rgb(247, 244, 251)")
    await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute("content", "#f7f4fb")
  })

  test("'system' follows the phone setting", async ({ browser }) => {
    for (const [scheme, expected] of [["light", "light"], ["dark", "dark"]] as const) {
      const ctx = await browser.newContext({ colorScheme: scheme })
      const page = await ctx.newPage()
      await page.addInitScript(() => localStorage.setItem("lv-theme", "system"))
      await page.goto("/login")
      await expect(page.locator("html")).toHaveAttribute("data-lv-theme", expected)
      await ctx.close()
    }
  })
})
