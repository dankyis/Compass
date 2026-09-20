"use client";

import { SubjectId, subjectLabel } from "@/domain/subject";

interface TopicPickerProps {
  subject: SubjectId;
  topics: string[];
  onSelect: (topic: string | null) => void;
  onBack: () => void;
}

// Lets a student narrow the next Practice Set to a single Topic, or clear the
// filter and go back to a random mix within the subject.
export function TopicPicker({ subject, topics, onSelect, onBack }: TopicPickerProps) {
  return (
    <section className="subjects" aria-label="Choose a topic">
      <h2>{subjectLabel(subject)} topics</h2>
      <ul className="subject-list">
        <li>
          <button
            type="button"
            className="subject-option"
            onClick={() => onSelect(null)}
          >
            All topics — random mix
          </button>
        </li>
        {topics.map((topic) => (
          <li key={topic}>
            <button
              type="button"
              className="subject-option"
              onClick={() => onSelect(topic)}
            >
              {topic}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="practice-exit" onClick={onBack}>
        Back to subjects
      </button>
    </section>
  );
}
