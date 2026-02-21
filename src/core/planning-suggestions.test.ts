import { describe, expect, it } from "vitest";
import type { Task } from "../domain/types";
import { suggestDayPrioritiesFromWeek } from "./planning-suggestions";

function task(id: string, status: Task["status"], planScope: Task["planScope"] = "inbox"): Task {
  return {
    id,
    title: id,
    type: "task",
    status,
    planScope,
    createdAt: 1,
  };
}

describe("suggestDayPrioritiesFromWeek", () => {
  it("keeps current todo day priorities and fills from week priorities", () => {
    const tasks = [
      task("d1", "todo", "day"),
      task("w1", "todo", "week"),
      task("w2", "done", "week"),
      task("w3", "todo", "week"),
    ];

    const suggested = suggestDayPrioritiesFromWeek(tasks, ["w1", "w2", "w3"], ["d1"], 3);
    expect(suggested).toEqual(["d1", "w1", "w3"]);
  });

  it("returns at most limit and skips duplicates", () => {
    const tasks = [task("a", "todo"), task("b", "todo"), task("c", "todo"), task("d", "todo")];
    const suggested = suggestDayPrioritiesFromWeek(tasks, ["b", "c", "d"], ["a", "b"], 3);
    expect(suggested).toEqual(["a", "b", "c"]);
  });
});
