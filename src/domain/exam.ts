// Exam track domain seam.
// The single place that decides what a valid exam track is and how an
// unknown/legacy value is normalized. UI and storage both call through here.

export const EXAM_TRACKS = ["BECE", "WASSCE"] as const;

export type ExamTrack = (typeof EXAM_TRACKS)[number];

export const DEFAULT_EXAM_TRACK: ExamTrack = "BECE";

export function isExamTrack(value: unknown): value is ExamTrack {
  return typeof value === "string" && (EXAM_TRACKS as readonly string[]).includes(value);
}

/**
 * Coerce any stored or user-supplied value into a valid ExamTrack.
 * Unknown values fall back to the default so a corrupted store never
 * leaves the Exam Toggle in a broken state.
 */
export function normalizeExamTrack(value: unknown): ExamTrack {
  return isExamTrack(value) ? value : DEFAULT_EXAM_TRACK;
}

export function examTrackLabel(track: ExamTrack): string {
  return track === "BECE" ? "BECE (JHS)" : "WASSCE (SHS)";
}
