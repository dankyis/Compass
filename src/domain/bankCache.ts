// Bank cache seam.
// Keeps the Question bank on-device so a full Practice Set runs with no
// network. The store is any async key/value backend (IndexedDB in the browser,
// a fake in tests), so the caching rule is testable without a browser.

import { ExamTrack } from "./exam";
import { SubjectId } from "./subject";
import { OPTION_KEYS, Question } from "./question";

export const BANK_CACHE_PREFIX = "compass.bank";

export interface BankStore {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
}

/** One cache slot per track and subject. */
export function bankCacheKey(exam: ExamTrack, subject: SubjectId): string {
  return `${BANK_CACHE_PREFIX}.${exam}.${subject}`;
}

export function encodeBank(questions: Question[]): string {
  return JSON.stringify(questions);
}

function isQuestion(value: unknown): value is Question {
  if (typeof value !== "object" || value === null) return false;
  const q = value as Record<string, unknown>;
  return (
    typeof q.id === "string" &&
    typeof q.exam === "string" &&
    typeof q.subject === "string" &&
    typeof q.topic === "string" &&
    typeof q.prompt === "string" &&
    Array.isArray(q.options) &&
    q.options.length === OPTION_KEYS.length &&
    q.options.every((option) => typeof option === "string") &&
    typeof q.correct === "string" &&
    (OPTION_KEYS as readonly string[]).includes(q.correct) &&
    typeof q.source === "string" &&
    typeof q.explanation === "string"
  );
}

/** Parse a cached bank, rejecting anything that is not a valid Question list. */
export function decodeBank(raw: string | null): Question[] | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.every(isQuestion) ? (parsed as Question[]) : null;
  } catch {
    return null;
  }
}

/** Read the cached bank for a track/subject, or null when absent/invalid. */
export async function loadCachedBank(
  store: BankStore,
  exam: ExamTrack,
  subject: SubjectId,
): Promise<Question[] | null> {
  return decodeBank(await store.read(bankCacheKey(exam, subject)));
}

/** Cache the bank for a track/subject. */
export async function saveBank(
  store: BankStore,
  exam: ExamTrack,
  subject: SubjectId,
  questions: Question[],
): Promise<void> {
  await store.write(bankCacheKey(exam, subject), encodeBank(questions));
}

/**
 * Resolve the bank for a track/subject, preferring the on-device cache and
 * falling back to the supplied pool (which is then cached for next time).
 */
export async function resolveBank(
  store: BankStore,
  exam: ExamTrack,
  subject: SubjectId,
  pool: Question[],
): Promise<Question[]> {
  const cached = await loadCachedBank(store, exam, subject);
  if (cached) return cached;
  if (pool.length > 0) await saveBank(store, exam, subject, pool);
  return pool;
}
