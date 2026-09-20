// Persistence seam for the student's chosen Exam Track.
// Takes any key/value store (localStorage in the browser, a fake in tests)
// so the persistence rule is testable without a browser.

import { ExamTrack, normalizeExamTrack } from "./exam";
import { EMPTY_PROGRESS, Progress, normalizeProgress } from "./progress";

export const EXAM_TRACK_STORAGE_KEY = "compass.examTrack";
export const PROGRESS_STORAGE_KEY = "compass.progress";

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
