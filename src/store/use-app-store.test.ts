import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { clearAllData } from "../storage/repository";
import { createAppStore } from "./use-app-store";

describe("AppStore", () => {
  afterEach(async () => {
    await clearAllData();
  });

  it("adds task and applies xp on completion", async () => {
    const store = createAppStore();
    const id = await store.getState().addTask("Прочитать 10 страниц", "task");
    await store.getState().toggleTaskDone(id);

    expect(store.getState().rpg.xpTotal).toBeGreaterThan(0);
    expect(store.getState().tasks.find((t) => t.id === id)?.status).toBe("done");
  });
});
