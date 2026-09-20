import { describe, it, expect } from "vitest";
import { assemblePracticeSet, PRACTICE_SET_SIZE } from "./practiceSet";
import { Question } from "./question";

function makePool(n: number): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `q${i + 1}`,
    exam: "WASSCE" as const,
    subject: "mathematics" as const,
    topic: "T",
    prompt: `Q${i + 1}`,
    options: ["1", "2", "3", "4"],
    correct: "A" as const,
    source: "s",
    explanation: "",
  }));
}

const alwaysZero = () => 0;

describe("assemblePracticeSet", () => {
  it("defaults to a set of 10", () => {
    expect(PRACTICE_SET_SIZE).toBe(10);
    expect(assemblePracticeSet(makePool(96))).toHaveLength(10);
  });

  it("never repeats a question", () => {
    const set = assemblePracticeSet(makePool(96));
    expect(new Set(set.map((q) => q.id)).size).toBe(set.length);
  });

  it("returns the whole pool when it is smaller than the set size", () => {
    expect(assemblePracticeSet(makePool(4))).toHaveLength(4);
  });

  it("returns an empty set for an empty pool", () => {
    expect(assemblePracticeSet([])).toEqual([]);
  });

  it("is deterministic for a fixed random source", () => {
    const a = assemblePracticeSet(makePool(20), 5, alwaysZero);
    const b = assemblePracticeSet(makePool(20), 5, alwaysZero);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });
});
