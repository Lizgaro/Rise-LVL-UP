import { expect, test } from "@playwright/test";

test("smoke page title", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=Rise LVL UP")).toBeVisible();
});
