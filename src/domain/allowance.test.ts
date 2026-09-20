import { describe, it, expect } from "vitest";
import {
  EMPTY_ALLOWANCE,
  FREE_ALLOWANCE,
  consumed,
  isExhausted,
  normalizeAllowance,
  recordAnswered,
  remaining,
} from "./allowance";

describe("remaining", () => {
  it("starts at the full free allowance", () => {
    expect(FREE_ALLOWANCE).toBe(10);
    expect(remaining(EMPTY_ALLOWANCE, "mathematics")).toBe(10);
  });

  it("counts down as questions are answered", () => {
    const after = recordAnswered(EMPTY_ALLOWANCE, "mathematics", 4);
    expect(remaining(after, "mathematics")).toBe(6);
  });

  it("never goes below zero", () => {
    const after = recordAnswered(EMPTY_ALLOWANCE, "mathematics", 25);
    expect(remaining(after, "mathematics")).toBe(0);
  });
});

describe("per-subject accounting", () => {
  it("keeps subjects independent", () => {
    let a = recordAnswered(EMPTY_ALLOWANCE, "mathematics", 10);
    expect(isExhausted(a, "mathematics")).toBe(true);
    expect(isExhausted(a, "integrated-science")).toBe(false);
    expect(remaining(a, "english")).toBe(10);
    a = recordAnswered(a, "english", 3);
    expect(remaining(a, "english")).toBe(7);
    expect(consumed(a, "mathematics")).toBe(10);
  });

  it("defaults to one answered question per call", () => {
    const after = recordAnswered(EMPTY_ALLOWANCE, "mathematics");
    expect(consumed(after, "mathematics")).toBe(1);
  });

  it("does not mutate the input", () => {
    const before: typeof EMPTY_ALLOWANCE = {};
    recordAnswered(before, "mathematics", 5);
    expect(before).toEqual({});
  });
});

describe("isExhausted", () => {
  it("flips exactly at the free allowance", () => {
    const nine = recordAnswered(EMPTY_ALLOWANCE, "mathematics", 9);
    const ten = recordAnswered(EMPTY_ALLOWANCE, "mathematics", 10);
    expect(isExhausted(nine, "mathematics")).toBe(false);
    expect(isExhausted(ten, "mathematics")).toBe(true);
  });
});

describe("normalizeAllowance", () => {
  it("passes through a valid value", () => {
    expect(normalizeAllowance({ mathematics: 3 })).toEqual({ mathematics: 3 });
  });

  it("resets on a non-object", () => {
    expect(normalizeAllowance(null)).toEqual(EMPTY_ALLOWANCE);
    expect(normalizeAllowance("junk")).toEqual(EMPTY_ALLOWANCE);
  });

  it("drops unknown subjects and bad counts", () => {
    expect(
      normalizeAllowance({
        mathematics: 4,
        astronomy: 2,
        english: -1,
        "integrated-science": "lots",
      }),
    ).toEqual({ mathematics: 4 });
  });

  it("floors fractional counts", () => {
    expect(normalizeAllowance({ mathematics: 3.9 })).toEqual({ mathematics: 3 });
  });
});
