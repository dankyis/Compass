import { describe, it, expect } from "vitest";
import { loadExamTrack, saveExamTrack, EXAM_TRACK_STORAGE_KEY } from "./storage";
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
