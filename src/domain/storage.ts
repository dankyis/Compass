// Persistence seam for the student's on-device state: the chosen Exam Track,
// Progress Tracking, and the Free Allowance. Takes any key/value store
// (localStorage in the browser, a fake in tests) so the persistence rules are
// testable without a browser.

import { ExamTrack, normalizeExamTrack } from "./exam";
import { EMPTY_PROGRESS, Progress, normalizeProgress } from "./progress";
import { Allowance, EMPTY_ALLOWANCE, normalizeAllowance } from "./allowance";

export const EXAM_TRACK_STORAGE_KEY = "compass.examTrack";
export const PROGRESS_STORAGE_KEY = "compass.progress";
export const ALLOWANCE_STORAGE_KEY = "compass.allowance";

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadExamTrack(store: KeyValueStore): ExamTrack {
  return normalizeExamTrack(store.getItem(EXAM_TRACK_STORAGE_KEY));
}

export function saveExamTrack(store: KeyValueStore, track: ExamTrack): void {
  store.setItem(EXAM_TRACK_STORAGE_KEY, track);
}

/** Read the on-device Progress, falling back to empty when absent or corrupt. */
export function loadProgress(store: KeyValueStore): Progress {
  const raw = store.getItem(PROGRESS_STORAGE_KEY);
  if (raw === null) return EMPTY_PROGRESS;
  try {
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(store: KeyValueStore, progress: Progress): void {
  store.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

/** Read the on-device Free Allowance, falling back to empty when corrupt. */
export function loadAllowance(store: KeyValueStore): Allowance {
  const raw = store.getItem(ALLOWANCE_STORAGE_KEY);
  if (raw === null) return EMPTY_ALLOWANCE;
  try {
    return normalizeAllowance(JSON.parse(raw));
  } catch {
    return EMPTY_ALLOWANCE;
  }
}

export function saveAllowance(store: KeyValueStore, allowance: Allowance): void {
  store.setItem(ALLOWANCE_STORAGE_KEY, JSON.stringify(allowance));
}
