import { describe, it, expect } from "vitest";
import { EMPTY_PROGRESS, recordSet } from "./progress";
import {
  EXAM_TRACK_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  loadExamTrack,
  loadProgress,
  saveExamTrack,
  saveProgress,
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
