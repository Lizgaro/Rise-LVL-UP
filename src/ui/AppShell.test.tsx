import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "../App";

describe("Russian UI", () => {
  it("renders Jules dashboard shell and focus-first content", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("Быстрый старт (1 минута)");
    expect(html).toContain("Modern Samurai");
    expect(html).toContain("Фокус");
    expect(html).toContain("Задачи");
    expect(html).toContain("Цели");
    expect(html).toContain("Настройки");
    expect(html).toContain("Уровень");
    expect(html).toContain("Что делать сейчас");
    expect(html).toContain("Фокус дня");
    expect(html).toContain("Твои цели и приоритеты");
    expect(html).toContain("Фокус-таймер");
    expect(html).toContain("Скажи задачу, цель или команду");

    expect(html).not.toContain("Ревью дня и недели");
  });
});
