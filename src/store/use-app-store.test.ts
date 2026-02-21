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

  it("completes recovery quest after focus and task", async () => {
    const store = createAppStore();

    // Trigger relapse to start quest
    const hId = await store.getState().addHabit("Smoke", "quit");
    await store.getState().markHabitStatus(hId, "relapse");

    expect(store.getState().recoveryQuest?.status).toBe("active");

    // Do focus
    await store.getState().completeFocusSession();
    expect(store.getState().recoveryQuest?.focusDone).toBe(true);
    expect(store.getState().recoveryQuest?.status).toBe("active");

    // Do task
    const tId = await store.getState().addTask("Task", "task");
    await store.getState().toggleTaskDone(tId);

    expect(store.getState().recoveryQuest?.taskDone).toBe(true);
    expect(store.getState().recoveryQuest?.status).toBe("done");
  });
});
