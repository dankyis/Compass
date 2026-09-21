import { describe, it, expect } from "vitest";
import { EMPTY_PROGRESS, recordSet } from "./progress";
import { EMPTY_ALLOWANCE, recordAnswered } from "./allowance";
import {
  ACCOUNT_PROGRESS_STORAGE_KEY,
  ALLOWANCE_STORAGE_KEY,
  EXAM_TRACK_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  clearSession,
  loadAccountProgress,
  loadAllowance,
  loadExamTrack,
  loadProgress,
  loadSession,
  saveAccountProgress,
  saveAllowance,
  saveExamTrack,
  saveProgress,
  saveSession,
} from "./storage";
import { DEFAULT_EXAM_TRACK } from "./exam";

function fakeStore(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
    _dump: () => data,
  };
}

describe("exam track persistence", () => {
  it("returns the default track when nothing is stored", () => {
    expect(loadExamTrack(fakeStore())).toBe(DEFAULT_EXAM_TRACK);
  });

  it("round-trips a saved track", () => {
    const store = fakeStore();
    saveExamTrack(store, "WASSCE");
    expect(store._dump()[EXAM_TRACK_STORAGE_KEY]).toBe("WASSCE");
    expect(loadExamTrack(store)).toBe("WASSCE");
  });

  it("survives a corrupted stored value", () => {
    const store = fakeStore({ [EXAM_TRACK_STORAGE_KEY]: "not-a-track" });
    expect(loadExamTrack(store)).toBe(DEFAULT_EXAM_TRACK);
  });
});

describe("progress persistence", () => {
  it("returns empty progress when nothing is stored", () => {
    expect(loadProgress(fakeStore())).toEqual(EMPTY_PROGRESS);
  });

  it("round-trips saved progress", () => {
    const store = fakeStore();
    const saved = recordSet(
      EMPTY_PROGRESS,
      "mathematics",
      { correct: 7, total: 10 },
      "2026-09-20",
    );
    saveProgress(store, saved);
    expect(store._dump()[PROGRESS_STORAGE_KEY]).toBeTruthy();
    expect(loadProgress(store)).toEqual(saved);
  });

  it("survives corrupted stored JSON", () => {
    const store = fakeStore({ [PROGRESS_STORAGE_KEY]: "{not json" });
    expect(loadProgress(store)).toEqual(EMPTY_PROGRESS);
  });

  it("drops unknown shapes back to empty", () => {
    const store = fakeStore({ [PROGRESS_STORAGE_KEY]: JSON.stringify({ nope: 1 }) });
    expect(loadProgress(store)).toEqual({
      streak: 0,
      lastDay: null,
      accuracy: {},
    });
  });
});

describe("free allowance persistence", () => {
  it("returns an empty allowance when nothing is stored", () => {
    expect(loadAllowance(fakeStore())).toEqual(EMPTY_ALLOWANCE);
  });

  it("round-trips a saved allowance", () => {
    const store = fakeStore();
    const saved = recordAnswered(EMPTY_ALLOWANCE, "mathematics", 6);
    saveAllowance(store, saved);
    expect(store._dump()[ALLOWANCE_STORAGE_KEY]).toBeTruthy();
    expect(loadAllowance(store)).toEqual(saved);
  });

  it("survives corrupted stored JSON", () => {
    const store = fakeStore({ [ALLOWANCE_STORAGE_KEY]: "{not json" });
    expect(loadAllowance(store)).toEqual(EMPTY_ALLOWANCE);
  });

  it("drops unknown subjects from stored data", () => {
    const store = fakeStore({
      [ALLOWANCE_STORAGE_KEY]: JSON.stringify({ mathematics: 2, astronomy: 9 }),
    });
    expect(loadAllowance(store)).toEqual({ mathematics: 2 });
  });
});

describe("session persistence", () => {
  it("returns null when nobody is signed in", () => {
    expect(loadSession(fakeStore())).toBeNull();
  });

  it("round-trips a saved session", () => {
    const store = fakeStore();
    saveSession(store, { phone: "+233244123456" });
    expect(store._dump()[SESSION_STORAGE_KEY]).toBeTruthy();
    expect(loadSession(store)).toEqual({ phone: "+233244123456" });
  });

  it("clears on sign-out", () => {
    const store = fakeStore();
    saveSession(store, { phone: "+233244123456" });
    clearSession(store);
    expect(loadSession(store)).toBeNull();
  });

  it("survives a corrupted session", () => {
    const store = fakeStore({ [SESSION_STORAGE_KEY]: "{not json" });
    expect(loadSession(store)).toBeNull();
  });
});

describe("account progress persistence", () => {
  it("returns empty progress when nothing is stored", () => {
    expect(loadAccountProgress(fakeStore())).toEqual(EMPTY_PROGRESS);
  });

  it("round-trips saved account progress", () => {
    const store = fakeStore();
    const saved = recordSet(EMPTY_PROGRESS, "english", { correct: 4, total: 10 }, "2026-09-20");
    saveAccountProgress(store, saved);
    expect(store._dump()[ACCOUNT_PROGRESS_STORAGE_KEY]).toBeTruthy();
    expect(loadAccountProgress(store)).toEqual(saved);
  });
});
