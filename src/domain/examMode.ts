// Exam Mode seam.
// The single place that decides how long a Practice Set may run under the
// optional timer and how much time is left. Pure arithmetic, so the rule is
// testable without a browser or a real clock.

export const EXAM_MODE_SECONDS_PER_QUESTION = 60;

/** The time limit for a set of `questionCount` questions, in milliseconds. */
export function timeLimitMillis(questionCount: number): number {
  return Math.max(0, questionCount) * EXAM_MODE_SECONDS_PER_QUESTION * 1000;
}

/** Milliseconds left before the deadline, never below zero. */
export function remainingMillis(deadline: number, now: number): number {
  return Math.max(0, deadline - now);
}

/** Whole seconds left, rounded up so the final second stays visible. */
export function remainingSeconds(deadline: number, now: number): number {
  return Math.ceil(remainingMillis(deadline, now) / 1000);
}

/** Whether the deadline has been reached. */
export function isExpired(deadline: number, now: number): boolean {
  return remainingMillis(deadline, now) <= 0;
}

/** Format a whole number of seconds as M:SS, clamped at zero. */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
