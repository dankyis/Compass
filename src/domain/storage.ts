// Persistence seam for the student's chosen Exam Track.
// Takes any key/value store (localStorage in the browser, a fake in tests)
// so the persistence rule is testable without a browser.

import { ExamTrack, normalizeExamTrack } from "./exam";

export const EXAM_TRACK_STORAGE_KEY = "compass.examTrack";

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
