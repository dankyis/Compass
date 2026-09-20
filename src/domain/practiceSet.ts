// Practice Set seam.
// Assembles a short run of questions from a subject's pool. Randomised, but
// the random source is injectable so the rule is testable without a browser.

import { Question } from "./question";

export const PRACTICE_SET_SIZE = 10;

export type RandomSource = () => number;

/**
 * Pick a Practice Set from a pool: shuffled, no repeats, capped at `size`.
 * If the pool is smaller than `size`, the whole pool is returned.
 */
export function assemblePracticeSet(
  pool: Question[],
  size: number = PRACTICE_SET_SIZE,
  rng: RandomSource = Math.random,
): Question[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(size, shuffled.length));
}
