// Free Allowance seam.
// The single place that decides how many Questions a student may answer per
// Subject for free, and when the Sign-in Wall should appear. Pure arithmetic
// over a plain Allowance value, so the rule is testable without a browser.

import { SubjectId, isSubjectId } from "./subject";

export const FREE_ALLOWANCE = 10;

/** Answered-question counts per Subject. */
export type Allowance = Partial<Record<SubjectId, number>>;

export const EMPTY_ALLOWANCE: Allowance = {};

/** Questions answered in a subject so far. */
export function consumed(allowance: Allowance, subject: SubjectId): number {
  return allowance[subject] ?? 0;
}

/** Free Questions left in a subject, never below zero. */
export function remaining(allowance: Allowance, subject: SubjectId): number {
  return Math.max(0, FREE_ALLOWANCE - consumed(allowance, subject));
}

/** Whether the subject's Free Allowance is used up. */
export function isExhausted(allowance: Allowance, subject: SubjectId): boolean {
  return remaining(allowance, subject) <= 0;
}

/** Record answered Questions in a subject. Does not mutate the input. */
export function recordAnswered(
  allowance: Allowance,
  subject: SubjectId,
  count = 1,
): Allowance {
  const safeCount = Math.max(0, Math.floor(count));
  return { ...allowance, [subject]: consumed(allowance, subject) + safeCount };
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/** Coerce any stored value into a valid Allowance; unknown shapes reset. */
export function normalizeAllowance(value: unknown): Allowance {
  if (typeof value !== "object" || value === null) return EMPTY_ALLOWANCE;
  const result: Allowance = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (isSubjectId(key) && isCount(entry)) result[key] = Math.floor(entry);
  }
  return result;
}
