// Persistence seam for the student's on-device state: the chosen Exam Track,
// Progress Tracking, the Free Allowance, and the signed-in Session. Takes any
// key/value store (localStorage in the browser, a fake in tests) so the
// persistence rules are testable without a browser.

import { ExamTrack, normalizeExamTrack } from "./exam";
import { Progress, normalizeProgress } from "./progress";
import { Allowance, normalizeAllowance } from "./allowance";
import { Session } from "./auth";

export const EXAM_TRACK_STORAGE_KEY = "compass.examTrack";
export const PROGRESS_STORAGE_KEY = "compass.progress";
export const ALLOWANCE_STORAGE_KEY = "compass.allowance";
export const SESSION_STORAGE_KEY = "compass.session";
export const ACCOUNT_PROGRESS_STORAGE_KEY = "compass.accountProgress";

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

function loadJson(store: KeyValueStore, key: string): unknown {
  const raw = store.getItem(key);
  if (raw === null || raw === "") return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Read the on-device Progress, falling back to empty when absent or corrupt. */
export function loadProgress(store: KeyValueStore): Progress {
  return normalizeProgress(loadJson(store, PROGRESS_STORAGE_KEY));
}

export function saveProgress(store: KeyValueStore, progress: Progress): void {
  store.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

/** Read the on-device Free Allowance, falling back to empty when corrupt. */
export function loadAllowance(store: KeyValueStore): Allowance {
  return normalizeAllowance(loadJson(store, ALLOWANCE_STORAGE_KEY));
}

export function saveAllowance(store: KeyValueStore, allowance: Allowance): void {
  store.setItem(ALLOWANCE_STORAGE_KEY, JSON.stringify(allowance));
}

/** Read the signed-in Session, or null when nobody is signed in. */
export function loadSession(store: KeyValueStore): Session | null {
  const value = loadJson(store, SESSION_STORAGE_KEY);
  if (typeof value !== "object" || value === null) return null;
  const phone = (value as Record<string, unknown>).phone;
  return typeof phone === "string" && phone.length > 0 ? { phone } : null;
}

export function saveSession(store: KeyValueStore, session: Session): void {
  store.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(store: KeyValueStore): void {
  store.setItem(SESSION_STORAGE_KEY, "");
}

/** The Progress held against the signed-in account. */
export function loadAccountProgress(store: KeyValueStore): Progress {
  return normalizeProgress(loadJson(store, ACCOUNT_PROGRESS_STORAGE_KEY));
}

export function saveAccountProgress(store: KeyValueStore, progress: Progress): void {
  store.setItem(ACCOUNT_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}
