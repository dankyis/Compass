// Seed data seam.
// The authoring format for question content before it becomes bank Questions.

import { ExamTrack } from "./exam";
import { SubjectId } from "./subject";
import { OptionKey } from "./question";

export interface SeedQuestion {
  prompt: string;
  options: string[];
  correct: OptionKey;
  source: string;
  explanation?: string;
}

export interface SeedTopic {
  exam: ExamTrack;
  subject: SubjectId;
  topic: string;
  questions: SeedQuestion[];
}
