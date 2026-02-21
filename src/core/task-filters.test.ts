import { describe, expect, it } from "vitest";
import { filterTasksByView } from "./task-filters";
import type { Task } from "../domain/types";

function task(
  id: string,
  status: Task["status"] = "todo",
  planScope: Task["planScope"] = "inbox",
): Task {
  return {
    id,
    title: id,
    type: "task",
    status,
    planScope,
    createdAt: 1,
  };
}

describe("filterTasksByView", () => {
  const tasks = [
    task("todo-inbox", "todo", "inbox"),
    task("todo-day", "todo", "day"),
    task("todo-week", "todo", "week"),
    task("done-day", "done", "day"),
    task("missed-week", "missed", "week"),
  ];

  it("returns only active tasks for active filter", () => {
    expect(filterTasksByView(tasks, "active").map((item) => item.id)).toEqual([
      "todo-inbox",
      "todo-day",
      "todo-week",
    ]);
  });

  it("returns plan-scope subsets", () => {
    expect(filterTasksByView(tasks, "day").map((item) => item.id)).toEqual(["todo-day", "done-day"]);
    expect(filterTasksByView(tasks, "week").map((item) => item.id)).toEqual(["todo-week", "missed-week"]);
  });

  it("returns status subsets", () => {
    expect(filterTasksByView(tasks, "done").map((item) => item.id)).toEqual(["done-day"]);
    expect(filterTasksByView(tasks, "missed").map((item) => item.id)).toEqual(["missed-week"]);
  });
});
