import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

describe("Russian UI", () => {
  it("renders new design structure in Russian", () => {
    const html = renderToStaticMarkup(<AppShell />);

    // Header
    expect(html).toContain("Rise LVL UP");
    expect(html).toContain("Путь воина");
    expect(html).toContain("Фокус дня");

    // Sidebar Goals
    expect(html).toContain("Ваши цели");

    // Timer
    expect(html).toContain("Таймер фокуса");

    // Sidebar Stats
    expect(html).toContain("Неделя");
    expect(html).toContain("Месяц");
    expect(html).toContain("Часов в потоке");

    // Footer
    expect(html).toContain("Запишите свою следующую битву");
  });
});
