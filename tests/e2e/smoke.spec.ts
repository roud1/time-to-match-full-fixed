import { test, expect } from "@playwright/test"

test("homepage loads", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/Time to Match/i)
})

test("login page loads", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
})
