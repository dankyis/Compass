import { describe, it, expect } from "vitest";
import {
  EMPTY_PROGRESS,
  accuracyPercent,
  dayGap,
  nextStreak,
  normalizeProgress,
  recordSet,
  toDayKey,
} from "./progress";

describe("toDayKey", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(toDayKey(new Date(2026, 8, 20))).toBe("2026-09-20");
    expect(toDayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("dayGap", () => {
  it("counts whole days between keys", () => {
    expect(dayGap("2026-09-20", "2026-09-21")).toBe(1);
    expect(dayGap("2026-09-20", "2026-09-20")).toBe(0);
    expect(dayGap("2026-09-20", "2026-09-25")).toBe(5);
  });

  it("spans month boundaries", () => {
    expect(dayGap("2026-01-31", "2026-02-01")).toBe(1);
  });

  it("is null for malformed keys", () => {
    expect(dayGap("nope", "2026-09-20")).toBeNull();
  });
});

describe("nextStreak", () => {
  it("starts at 1 for a first ever set", () => {
    expect(nextStreak(0, null, "2026-09-20")).toBe(1);
  });

  it("keeps the streak on the same day", () => {
    expect(nextStreak(3, "2026-09-20", "2026-09-20")).toBe(3);
  });

  it("extends the streak the next day", () => {
    expect(nextStreak(3, "2026-09-19", "2026-09-20")).toBe(4);
  });

  it("resets after a missed day", () => {
    expect(nextStreak(9, "2026-09-17", "2026-09-20")).toBe(1);
  });
});

describe("recordSet", () => {
  it("accumulates per-subject accuracy", () => {
    const after = recordSet(EMPTY_PROGRESS, "mathematics", { correct: 7, total: 10 }, "2026-09-20");
    expect(after.accuracy.mathematics).toEqual({ correct: 7, total: 10 });
  });

  it("keeps subjects independent", () => {
    let p = recordSet(EMPTY_PROGRESS, "mathematics", { correct: 7, total: 10 }, "2026-09-20");
    p = recordSet(p, "english", { correct: 2, total: 10 }, "2026-09-20");
    expect(p.accuracy.mathematics).toEqual({ correct: 7, total: 10 });
    expect(p.accuracy.english).toEqual({ correct: 2, total: 10 });
  });

  it("adds to an existing subject total", () => {
    let p = recordSet(EMPTY_PROGRESS, "mathematics", { correct: 7, total: 10 }, "2026-09-20");
    p = recordSet(p, "mathematics", { correct: 5, total: 10 }, "2026-09-21");
    expect(p.accuracy.mathematics).toEqual({ correct: 12, total: 20 });
    expect(p.streak).toBe(2);
  });

  it("does not mutate the input", () => {
    const before = { ...EMPTY_PROGRESS, accuracy: {} };
    recordSet(before, "mathematics", { correct: 1, total: 10 }, "2026-09-20");
    expect(before.accuracy).toEqual({});
    expect(before.streak).toBe(0);
  });
});

describe("accuracyPercent", () => {
  it("rounds to a whole percentage", () => {
    expect(accuracyPercent({ correct: 7, total: 10 })).toBe(70);
    expect(accuracyPercent({ correct: 2, total: 3 })).toBe(67);
  });

  it("is null with no answers", () => {
    expect(accuracyPercent(undefined)).toBeNull();
    expect(accuracyPercent({ correct: 0, total: 0 })).toBeNull();
  });
});

describe("normalizeProgress", () => {
  it("passes through a valid value", () => {
    const p = recordSet(EMPTY_PROGRESS, "mathematics", { correct: 7, total: 10 }, "2026-09-20");
    expect(normalizeProgress(p)).toEqual(p);
  });

  it("resets on a non-object", () => {
    expect(normalizeProgress(null)).toEqual(EMPTY_PROGRESS);
    expect(normalizeProgress("junk")).toEqual(EMPTY_PROGRESS);
  });

  it("drops unknown subjects and bad totals", () => {
    const messy = {
      streak: 2,
      lastDay: "2026-09-20",
      accuracy: {
        mathematics: { correct: 1, total: 2 },
        astronomy: { correct: 1, total: 2 },
        english: { correct: 5, total: 2 },
      },
    };
    expect(normalizeProgress(messy)).toEqual({
      streak: 2,
      lastDay: "2026-09-20",
      accuracy: { mathematics: { correct: 1, total: 2 } },
    });
  });

  it("clamps a negative streak to zero", () => {
    expect(normalizeProgress({ streak: -4 }).streak).toBe(0);
  });
});
