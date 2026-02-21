import { defineConfig } from "@playwright/test";

function mergeNoProxy(current: string | undefined, hosts: string[]): string {
  const items = new Set(
    (current ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
  hosts.forEach((host) => items.add(host));
  return Array.from(items).join(",");
}

const localhostHosts = ["localhost", "127.0.0.1"];
process.env.NO_PROXY = mergeNoProxy(process.env.NO_PROXY, localhostHosts);
process.env.no_proxy = mergeNoProxy(process.env.no_proxy, localhostHosts);

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:4173",
    headless: true,
  },
  webServer: {
    command: "npm run dev -- --host localhost --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
