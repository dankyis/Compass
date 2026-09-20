import { describe, it, expect } from "vitest";
import {
  EXAM_TRACKS,
  DEFAULT_EXAM_TRACK,
  isExamTrack,
  normalizeExamTrack,
  examTrackLabel,
} from "./exam";

describe("exam track domain seam", () => {
  it("offers exactly the two Ghanaian exam tracks", () => {
    expect(EXAM_TRACKS).toEqual(["BECE", "WASSCE"]);
  });

  it("accepts known tracks and rejects unknown ones", () => {
    expect(isExamTrack("BECE")).toBe(true);
    expect(isExamTrack("WASSCE")).toBe(true);
    expect(isExamTrack("JAMB")).toBe(false);
    expect(isExamTrack(undefined)).toBe(false);
    expect(isExamTrack(7)).toBe(false);
  });

  it("normalizes valid values unchanged", () => {
    expect(normalizeExamTrack("WASSCE")).toBe("WASSCE");
    expect(normalizeExamTrack("BECE")).toBe("BECE");
  });

  it("falls back to the default track for anything invalid", () => {
    expect(normalizeExamTrack(null)).toBe(DEFAULT_EXAM_TRACK);
    expect(normalizeExamTrack("jhs")).toBe(DEFAULT_EXAM_TRACK);
    expect(normalizeExamTrack({})).toBe(DEFAULT_EXAM_TRACK);
  });

  it("labels the tracks for students", () => {
    expect(examTrackLabel("BECE")).toBe("BECE (JHS)");
    expect(examTrackLabel("WASSCE")).toBe("WASSCE (SHS)");
  });
});
