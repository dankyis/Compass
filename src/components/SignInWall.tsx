"use client";

import { SubjectId, subjectLabel } from "@/domain/subject";

interface SignInWallProps {
  subject: SubjectId;
  onBack: () => void;
}

// The Sign-in Wall: shown when a student has used up a subject's Free
// Allowance. Sign-in itself ships in a later ticket, so the prompt is honest
// about that while keeping the other subjects open.
export function SignInWall({ subject, onBack }: SignInWallProps) {
  return (
    <div className="wall" aria-label="Sign-in wall">
      <h3 className="wall-title">
        You have used your free {subjectLabel(subject)} questions
      </h3>
      <p className="wall-body">
        Sign in with your phone number to keep practising {subjectLabel(subject)}.
        Your other subjects stay free.
      </p>
      <div className="result-actions">
        <button type="button" className="subject-option" disabled>
          Sign in (coming soon)
        </button>
        <button type="button" className="practice-exit" onClick={onBack}>
          Back to subjects
        </button>
      </div>
    </div>
  );
}
