import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { clearAllData, getTasks, saveTask } from "./repository";
import type { Task } from "../domain/types";

describe("Repository", () => {
  afterEach(async () => {
    await clearAllData();
  });

  it("persists and reads tasks", async () => {
    const task: Task = {
      id: "t1",
      title: "Тест",
      type: "task",
      status: "todo",
      planScope: "inbox",
      createdAt: 1,
    };

    await saveTask(task);
    const tasks = await getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Тест");
  });
});
