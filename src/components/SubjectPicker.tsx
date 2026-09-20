"use client";

import { ExamTrack, examTrackLabel } from "@/domain/exam";
import { SubjectId, subjectLabel } from "@/domain/subject";

interface SubjectPickerProps {
  track: ExamTrack;
  subjects: SubjectId[];
  onSelect: (subject: SubjectId) => void;
}

// Shows the subjects that actually have content for the chosen track.
// When a track has no content yet, it says so instead of showing an empty list.
export function SubjectPicker({ track, subjects, onSelect }: SubjectPickerProps) {
  if (subjects.length === 0) {
    return (
      <section className="subjects" aria-label="Choose your subject">
        <p className="empty" aria-live="polite">
          No subjects for {examTrackLabel(track)} yet.
        </p>
      </section>
    );
  }

  return (
    <section className="subjects" aria-label="Choose your subject">
      <h2>Choose your subject</h2>
      <ul className="subject-list">
        {subjects.map((subject) => (
          <li key={subject}>
            <button
              type="button"
              className="subject-option"
              onClick={() => onSelect(subject)}
            >
              {subjectLabel(subject)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
