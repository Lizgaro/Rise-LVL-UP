import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";

describe("App smoke", () => {
  it("renders app branding", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("RISE");
    expect(html).toContain("Modern Samurai");
  });
});
