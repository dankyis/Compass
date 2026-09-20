// Question domain seam.
// The shape of a single multiple-choice item in the bank.

import { ExamTrack } from "./exam";
import { SubjectId } from "./subject";

export const OPTION_KEYS = ["A", "B", "C", "D"] as const;

export type OptionKey = (typeof OPTION_KEYS)[number];

export interface Question {
  /** Stable identity, derived from exam, subject, topic and position. */
  id: string;
  exam: ExamTrack;
  subject: SubjectId;
  topic: string;
  prompt: string;
  /** Exactly four options, in A-D order. */
  options: string[];
  correct: OptionKey;
  /** Where the past question appeared, e.g. "WASSCE June 2017 Qu 11". */
  source: string;
  /** One-line note on why the correct answer is correct. Empty until authored. */
  explanation: string;
}
