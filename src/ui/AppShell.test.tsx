import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "../App";

describe("Russian UI", () => {
  it("renders core sections in Russian", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Фокус-таймер");
    expect(html).toContain("Сегодня");
    expect(html).toContain("Неделя");
    expect(html).toContain("Привычки");
  });
});
