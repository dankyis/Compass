// Subject domain seam.
// The single place that decides which subjects exist and how they are labelled.

export const SUBJECTS = ["mathematics", "integrated-science", "english"] as const;

export type SubjectId = (typeof SUBJECTS)[number];

export const SUBJECT_LABELS: Record<SubjectId, string> = {
  mathematics: "Core Mathematics",
  "integrated-science": "Integrated Science",
  english: "English Language",
};

export function isSubjectId(value: unknown): value is SubjectId {
  return typeof value === "string" && (SUBJECTS as readonly string[]).includes(value);
}

export function subjectLabel(subject: SubjectId): string {
  return SUBJECT_LABELS[subject];
}
