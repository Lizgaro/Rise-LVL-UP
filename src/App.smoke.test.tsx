import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";

describe("App smoke", () => {
  it("renders app title in Russian", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Rise LVL UP");
  });
});
