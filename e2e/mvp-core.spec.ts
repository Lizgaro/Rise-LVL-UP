import { expect, test } from "@playwright/test";

test.describe("MVP core flows", () => {
  test("add task and mark done", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("task-input-field").fill("Тестовая задача");
    await page.getByTestId("task-submit-btn").click();
    await expect(page.getByText("Тестовая задача")).toBeVisible();

    await page.getByTestId("task-complete-check").first().click();
    await expect(page.getByRole("button", { name: "Вернуть" }).first()).toBeVisible();
  });

  test("day priorities are limited to three", async ({ page }) => {
    await page.goto("/");

    const taskInput = page.getByTestId("task-input-field");
    for (const title of ["Задача 1", "Задача 2", "Задача 3", "Задача 4"]) {
      await taskInput.fill(title);
      await page.getByTestId("task-submit-btn").click();
    }

    const todaySection = page.locator("section").filter({ hasText: "Сегодня" }).first();
    const checks = todaySection.locator('input[type="checkbox"]');
    await checks.nth(0).check();
    await checks.nth(1).check();
    await checks.nth(2).check();
    await checks.nth(3).check();

    await expect(page.getByText("Можно выбрать максимум 3 приоритета на день")).toBeVisible();
  });

  test("focus session gives xp", async ({ page }) => {
    await page.goto("/");

    const xpText = page.getByText(/Опыт \(XP\): \d+/).first();
    const before = Number((await xpText.textContent())?.replace(/\D+/g, "") ?? "0");

    await page.getByTestId("start-focus-btn").click();
    await page.getByTestId("complete-focus-btn").click();

    const after = Number((await xpText.textContent())?.replace(/\D+/g, "") ?? "0");
    expect(after).toBeGreaterThan(before);
  });

  test("habit relapse creates recovery quest", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("Новая привычка").fill("Без сигарет");
    await page.getByRole("button", { name: "Добавить" }).nth(1).click();
    await page.getByRole("button", { name: "Срыв" }).first().click();

    await expect(page.getByText("Активен recovery-квест")).toBeVisible();
  });

  test("noise can be toggled", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("noise-toggle-switch").selectOption("pink");
    await expect(page.getByTestId("noise-toggle-switch")).toHaveValue("pink");
    await page.getByTestId("volume-slider").fill("0.7");
  });
});
