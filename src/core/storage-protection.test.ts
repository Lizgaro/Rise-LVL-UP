import { describe, expect, it } from "vitest";
import { detectStorageProtection, requestStorageProtection } from "./storage-protection";

describe("storage-protection", () => {
  it("returns unsupported when storage API is unavailable", async () => {
    const status = await detectStorageProtection({});
    expect(status).toBe("unsupported");
  });

  it("detects granted persistent storage", async () => {
    const status = await detectStorageProtection({
      navigator: {
        storage: {
          persisted: async () => true,
          persist: async () => true,
        },
      },
    });
    expect(status).toBe("granted");
  });

  it("requests persistent storage when not yet granted", async () => {
    const status = await requestStorageProtection({
      navigator: {
        storage: {
          persisted: async () => false,
          persist: async () => true,
        },
      },
    });
    expect(status).toBe("granted");
  });

  it("keeps not_granted when browser refuses persistence", async () => {
    const status = await requestStorageProtection({
      navigator: {
        storage: {
          persisted: async () => false,
          persist: async () => false,
        },
      },
    });
    expect(status).toBe("not_granted");
  });
});
