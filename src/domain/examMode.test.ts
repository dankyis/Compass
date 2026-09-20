import { describe, it, expect } from "vitest";
import {
  EXAM_MODE_SECONDS_PER_QUESTION,
  formatDuration,
  isExpired,
  remainingMillis,
  remainingSeconds,
  timeLimitMillis,
} from "./examMode";

describe("timeLimitMillis", () => {
  it("gives every question the same slice of time", () => {
    expect(timeLimitMillis(10)).toBe(10 * EXAM_MODE_SECONDS_PER_QUESTION * 1000);
  });

  it("is zero for an empty set", () => {
    expect(timeLimitMillis(0)).toBe(0);
  });
});

describe("remaining time", () => {
  it("counts down as time passes", () => {
    expect(remainingSeconds(10_000, 4_000)).toBe(6);
  });

  it("never goes below zero", () => {
    expect(remainingSeconds(10_000, 25_000)).toBe(0);
    expect(remainingMillis(10_000, 25_000)).toBe(0);
  });

  it("rounds up so the final second is visible", () => {
    expect(remainingSeconds(10_000, 9_500)).toBe(1);
  });
});

describe("isExpired", () => {
  it("is false while time is left", () => {
    expect(isExpired(10_000, 9_999)).toBe(false);
  });

  it("is true at and after the deadline", () => {
    expect(isExpired(10_000, 10_000)).toBe(true);
    expect(isExpired(10_000, 10_001)).toBe(true);
  });
});

describe("formatDuration", () => {
  it("formats minutes and seconds", () => {
    expect(formatDuration(600)).toBe("10:00");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(9)).toBe("0:09");
  });

  it("clamps negatives to zero", () => {
    expect(formatDuration(-5)).toBe("0:00");
  });
});
