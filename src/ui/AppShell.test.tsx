import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "../App";

describe("Russian UI", () => {
  it("renders focused default workspace in Russian", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Рабочий экран");
    expect(html).toContain("Фокус");
    expect(html).toContain("Планирование");
    expect(html).toContain("Ревью");
    expect(html).toContain("Все");
    expect(html).toContain("Режим фокуса");
    expect(html).toContain("Пауза");
    expect(html).toContain("Горячие клавиши");
    expect(html).toContain("Что делать сейчас");
    expect(html).toContain("Пульс дня");
    expect(html).toContain("Фокус-таймер");
    expect(html).not.toContain("Ревью дня и недели");
    expect(html).not.toContain("Готовность окружения");
  });
});
