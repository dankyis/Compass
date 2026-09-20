// Grading seam.
// The single place that decides whether a chosen option is correct, how a set
// is summarised, and which questions were missed.

import { OptionKey, Question } from "./question";

export function isCorrect(question: Question, choice: OptionKey): boolean {
  return question.correct === choice;
}

export interface SetResult {
  total: number;
  correct: number;
}

/**
 * Summarise a finished Practice Set. Answers map question id to the option the
 * student chose; unanswered questions count as incorrect.
 */
export function summarise(
  questions: Question[],
  answers: Record<string, OptionKey>,
): SetResult {
  const correct = questions.filter((q) => {
    const choice = answers[q.id];
    return choice !== undefined && isCorrect(q, choice);
  }).length;
  return { total: questions.length, correct };
}

/** The questions a student answered wrongly or left unanswered. */
export function missedQuestions(
  questions: Question[],
  answers: Record<string, OptionKey>,
): Question[] {
  return questions.filter((q) => {
    const choice = answers[q.id];
    return choice === undefined || !isCorrect(q, choice);
  });
}
