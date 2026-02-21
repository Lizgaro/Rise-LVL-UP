import { expect, test } from "@playwright/test";

test.describe("MVP core flows", () => {
  test("add task and mark done", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("task-input-field").fill("Тестовая задача");
    await page.getByTestId("task-submit-btn").click();
    await expect(
      page.getByTestId("task-item-active").filter({ hasText: "Тестовая задача" }).first(),
    ).toBeVisible();

    await page.getByTestId("task-complete-check").first().click();
    await expect(page.getByText("Активных: 0")).toBeVisible();
  });

  test("day priorities are limited to three", async ({ page }) => {
    await page.goto("/");

    const taskInput = page.getByTestId("task-input-field");
    for (const title of ["Задача 1", "Задача 2", "Задача 3", "Задача 4"]) {
      await taskInput.fill(title);
      await page.getByTestId("task-submit-btn").click();
      await expect(page.getByTestId("task-item-active").filter({ hasText: title }).first()).toBeVisible();
    }

    const checks = page.getByTestId("day-priority-checkbox");
    await expect(checks).toHaveCount(4);
    await checks.nth(0).check();
    await checks.nth(1).check();
    await checks.nth(2).check();
    await checks.nth(3).click();

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

    await page.getByTestId("habit-input-field").fill("Без сигарет");
    await page.getByTestId("habit-submit-btn").click();
    await page.getByTestId("habit-relapse-btn").first().click();

    await expect(page.getByText("Активен recovery-квест")).toBeVisible();
  });

  test("noise can be toggled", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("noise-toggle-switch").selectOption("pink");
    await expect(page.getByTestId("noise-toggle-switch")).toHaveValue("pink");
    await page.getByTestId("volume-slider").fill("0.7");
  });
});
