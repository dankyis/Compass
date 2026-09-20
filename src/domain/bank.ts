// Question bank seam.
// Assembles seed topics into the flat bank the app reads from, and answers
// the questions the practice loop asks of it.

import { ExamTrack } from "./exam";
import { SubjectId } from "./subject";
import { OPTION_KEYS, Question } from "./question";
import { SeedTopic } from "./seed";
import { algebraicExpressions } from "@/data/seed/algebraic-expressions";
import { changeOfSubject } from "@/data/seed/change-of-subject";
import { cellAndCellDivision } from "@/data/seed/cell-and-cell-division";
import { ecosystem } from "@/data/seed/ecosystem";

const SEED_TOPICS: SeedTopic[] = [algebraicExpressions, changeOfSubject, cellAndCellDivision, ecosystem];

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toQuestion(topic: SeedTopic, index: number): Question {
  const seed = topic.questions[index];
  if (seed.options.length !== OPTION_KEYS.length) {
    throw new Error(
      `Question ${index + 1} of "${topic.topic}" must have exactly ${OPTION_KEYS.length} options`,
    );
  }
  if (!(OPTION_KEYS as readonly string[]).includes(seed.correct)) {
    throw new Error(
      `Question ${index + 1} of "${topic.topic}" has an invalid correct option`,
    );
  }
  return {
    id: `${topic.exam}-${topic.subject}-${slug(topic.topic)}-${index + 1}`,
    exam: topic.exam,
    subject: topic.subject,
    topic: topic.topic,
    prompt: seed.prompt,
    options: seed.options,
    correct: seed.correct,
    source: seed.source,
    explanation: seed.explanation ?? "",
  };
}

/** Flatten seed topics into the flat Question bank. Pure and testable. */
export function buildBank(seedTopics: SeedTopic[]): Question[] {
  return seedTopics.flatMap((topic) =>
    topic.questions.map((_, index) => toQuestion(topic, index)),
  );
}

/** The bank the app reads from. */
export const QUESTION_BANK: Question[] = buildBank(SEED_TOPICS);

export function listSubjects(bank: Question[], exam: ExamTrack): SubjectId[] {
  const seen: SubjectId[] = [];
  for (const question of bank) {
    if (question.exam === exam && !seen.includes(question.subject)) {
      seen.push(question.subject);
    }
  }
  return seen;
}

export function questionsFor(
  bank: Question[],
  exam: ExamTrack,
  subject: SubjectId,
): Question[] {
  return bank.filter((q) => q.exam === exam && q.subject === subject);
}

export function topicsFor(
  bank: Question[],
  exam: ExamTrack,
  subject: SubjectId,
): string[] {
  const seen: string[] = [];
  for (const question of questionsFor(bank, exam, subject)) {
    if (!seen.includes(question.topic)) seen.push(question.topic);
  }
  return seen;
}
