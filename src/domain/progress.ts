// Progress Tracking seam.
// The single place that decides the practice streak and per-subject accuracy.
// Pure functions over a plain Progress value, so the rules are testable
// without a browser, storage, or a real clock.

import { SubjectId, isSubjectId } from "./subject";
import { SetResult } from "./grading";

export interface SubjectAccuracy {
  correct: number;
  total: number;
}

export interface Progress {
  /** Consecutive days with at least one finished Practice Set. */
  streak: number;
  /** The last day a set was finished, as a local YYYY-MM-DD key. */
  lastDay: string | null;
  /** Running totals per subject. */
  accuracy: Partial<Record<SubjectId, SubjectAccuracy>>;
}

export const EMPTY_PROGRESS: Progress = {
  streak: 0,
  lastDay: null,
  accuracy: {},
};

/** The local calendar day of a Date, as YYYY-MM-DD. */
export function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayKeyToUtcMillis(key: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const [, year, month, day] = match;
  return Date.UTC(Number(year), Number(month) - 1, Number(day));
}

/** Whole days from `from` to `to`; null when either key is malformed. */
export function dayGap(from: string, to: string): number | null {
  const a = dayKeyToUtcMillis(from);
  const b = dayKeyToUtcMillis(to);
  if (a === null || b === null) return null;
  return Math.round((b - a) / 86_400_000);
}

/**
 * The streak after finishing a set on `today`. Same day keeps the streak,
 * the next day extends it, and any bigger gap (or a first ever set) starts
 * a new streak at 1.
 */
export function nextStreak(
  streak: number,
  lastDay: string | null,
  today: string,
): number {
  if (lastDay === null) return 1;
  const gap = dayGap(lastDay, today);
  if (gap === null) return 1;
  if (gap <= 0) return Math.max(1, streak);
  if (gap === 1) return Math.max(1, streak) + 1;
  return 1;
}

/** Record a finished set: extend the streak and add to the subject totals. */
export function recordSet(
  progress: Progress,
  subject: SubjectId,
  result: SetResult,
  today: string,
): Progress {
  const previous = progress.accuracy[subject] ?? { correct: 0, total: 0 };
  return {
    streak: nextStreak(progress.streak, progress.lastDay, today),
    lastDay: today,
    accuracy: {
      ...progress.accuracy,
      [subject]: {
        correct: previous.correct + result.correct,
        total: previous.total + result.total,
      },
    },
  };
}

/** Accuracy for a subject as a whole percentage, or null with no answers. */
export function accuracyPercent(
  accuracy: SubjectAccuracy | undefined,
): number | null {
  if (!accuracy || accuracy.total === 0) return null;
  return Math.round((accuracy.correct / accuracy.total) * 100);
}

function isSubjectAccuracy(value: unknown): value is SubjectAccuracy {
  if (typeof value !== "object" || value === null) return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.correct === "number" &&
    typeof a.total === "number" &&
    a.correct >= 0 &&
    a.total >= 0 &&
    a.correct <= a.total
  );
}

/** Coerce any stored value into a valid Progress; unknown shapes reset. */
export function normalizeProgress(value: unknown): Progress {
  if (typeof value !== "object" || value === null) return EMPTY_PROGRESS;
  const raw = value as Record<string, unknown>;
  const streak =
    typeof raw.streak === "number" && raw.streak >= 0 ? Math.floor(raw.streak) : 0;
  const lastDay = typeof raw.lastDay === "string" ? raw.lastDay : null;
  const accuracy: Partial<Record<SubjectId, SubjectAccuracy>> = {};
  if (typeof raw.accuracy === "object" && raw.accuracy !== null) {
    for (const [key, entry] of Object.entries(
      raw.accuracy as Record<string, unknown>,
    )) {
      if (isSubjectId(key) && isSubjectAccuracy(entry)) accuracy[key] = entry;
    }
  }
  return { streak, lastDay, accuracy };
}
