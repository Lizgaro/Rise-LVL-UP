import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "../App";

describe("Russian UI", () => {
  it("renders core sections in Russian", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Готовность окружения");
    expect(html).toContain("Что делать сейчас");
    expect(html).toContain("Пульс дня");
    expect(html).toContain("Подобрать 3 из недели");
    expect(html).toContain("Фильтр списка");
    expect(html).toContain("Ревью дня и недели");
    expect(html).toContain("Сегодняшний прогресс");
    expect(html).toContain("Последние XP-события");
    expect(html).toContain("Стрики привычек");
    expect(html).toContain("Итоги недели");
    expect(html).toContain("Фокус-таймер");
    expect(html).toContain("Сегодня");
    expect(html).toContain("Неделя");
    expect(html).toContain("Привычки");
  });
});
