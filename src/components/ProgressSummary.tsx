"use client";

import { SubjectId, subjectLabel } from "@/domain/subject";
import { Progress, accuracyPercent } from "@/domain/progress";

interface ProgressSummaryProps {
  progress: Progress;
}

// A thin slice of Progress Tracking: the practice streak and per-subject
// accuracy, read from on-device storage by the caller.
export function ProgressSummary({ progress }: ProgressSummaryProps) {
  const subjects = Object.keys(progress.accuracy) as SubjectId[];
  const hasProgress = progress.streak > 0 || subjects.length > 0;

  if (!hasProgress) {
    return (
      <section className="progress" aria-label="Your progress">
        <p className="empty">Finish a set to start your streak.</p>
      </section>
    );
  }

  return (
    <section className="progress" aria-label="Your progress">
      <h2>Your progress</h2>
      <p className="progress-streak">
        Streak: <strong>{progress.streak}</strong>{" "}
        {progress.streak === 1 ? "day" : "days"}
      </p>
      {subjects.length > 0 && (
        <ul className="progress-list">
          {subjects.map((subject) => (
            <li key={subject} className="progress-item">
              <span>{subjectLabel(subject)}</span>
              <strong>{accuracyPercent(progress.accuracy[subject])}%</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
