import { describe, expect, it } from "vitest";
import App from "./App";

describe("App smoke", () => {
  it("renders app title in Russian", () => {
    const element = App();
    expect(String(element.props.children)).toContain("Rise LVL UP");
  });
});
