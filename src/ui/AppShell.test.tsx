import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "../App";

describe("Russian UI", () => {
  it("renders focused default workspace in Russian", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Быстрый старт (1 минута)");
    expect(html).toContain("Установить как приложение");

    // Sidebar
    expect(html).toContain("Главная");
    expect(html).toContain("Журнал");
    expect(html).toContain("Задачи");
    expect(html).toContain("Статистика");

    // Dashboard content
    expect(html).toContain("Что делать сейчас");
    expect(html).toContain("Пульс дня");
    expect(html).toContain("Фокус-таймер");
    expect(html).toContain("Готовность окружения"); // HealthBanner is now in Dashboard

    // ReviewCard is in Journal tab
    expect(html).not.toContain("Ревью дня и недели");
  });
});
