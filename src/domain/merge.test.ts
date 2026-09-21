import { describe, it, expect } from "vitest";
import { EMPTY_PROGRESS, Progress, recordSet } from "./progress";
import { mergeProgress } from "./merge";

function withSubject(
  subject: "mathematics" | "english" | "integrated-science",
  correct: number,
  total: number,
  day = "2026-09-20",
): Progress {
  return recordSet(EMPTY_PROGRESS, subject, { correct, total }, day);
}

describe("mergeProgress", () => {
  it("keeps each subject when only one side has it", () => {
    const local = withSubject("mathematics", 7, 10);
    const remote = withSubject("english", 4, 10);
    const merged = mergeProgress(local, remote);
    expect(merged.accuracy.mathematics).toEqual({ correct: 7, total: 10 });
    expect(merged.accuracy.english).toEqual({ correct: 4, total: 10 });
  });

  it("takes the higher-accuracy result per subject", () => {
    const local = withSubject("mathematics", 3, 10);
    const remote = withSubject("mathematics", 9, 10);
    expect(mergeProgress(local, remote).accuracy.mathematics).toEqual({
      correct: 9,
      total: 10,
    });
    expect(mergeProgress(remote, local).accuracy.mathematics).toEqual({
      correct: 9,
      total: 10,
    });
  });

  it("breaks an accuracy tie on more answers", () => {
    const small = withSubject("mathematics", 1, 2);
    const big = withSubject("mathematics", 5, 10);
    expect(mergeProgress(small, big).accuracy.mathematics).toEqual({
      correct: 5,
      total: 10,
    });
  });

  it("never loses progress from either side", () => {
    const local = withSubject("mathematics", 6, 10);
    const remote = withSubject("mathematics", 2, 10);
    expect(mergeProgress(local, remote).accuracy.mathematics).toEqual({
      correct: 6,
      total: 10,
    });
  });

  it("keeps the longer streak", () => {
    const local = { ...EMPTY_PROGRESS, streak: 3, lastDay: "2026-09-20" };
    const remote = { ...EMPTY_PROGRESS, streak: 8, lastDay: "2026-09-19" };
    expect(mergeProgress(local, remote).streak).toBe(8);
  });

  it("keeps the most recent practice day", () => {
    const local = { ...EMPTY_PROGRESS, lastDay: "2026-09-18" };
    const remote = { ...EMPTY_PROGRESS, lastDay: "2026-09-20" };
    expect(mergeProgress(local, remote).lastDay).toBe("2026-09-20");
    expect(mergeProgress(remote, local).lastDay).toBe("2026-09-20");
  });

  it("handles an empty side", () => {
    const local = withSubject("english", 5, 10);
    expect(mergeProgress(local, EMPTY_PROGRESS)).toEqual(local);
    expect(mergeProgress(EMPTY_PROGRESS, local)).toEqual(local);
  });

  it("does not mutate its inputs", () => {
    const local = withSubject("mathematics", 7, 10);
    const remote = withSubject("english", 2, 10);
    const before = JSON.stringify({ local, remote });
    mergeProgress(local, remote);
    expect(JSON.stringify({ local, remote })).toBe(before);
  });
});
