"use client";

import { SubjectId, subjectLabel } from "@/domain/subject";

interface SignInWallProps {
  subject: SubjectId;
  onSignIn?: () => void;
  onBack: () => void;
}

// The Sign-in Wall: shown when a student has used up a subject's Free
// Allowance. Signing in merges their on-device progress and keeps the other
// subjects free.
export function SignInWall({ subject, onSignIn, onBack }: SignInWallProps) {
  return (
    <div className="wall" aria-label="Sign-in wall">
      <h3 className="wall-title">
        You have used your free {subjectLabel(subject)} questions
      </h3>
      <p className="wall-body">
        Sign in with your phone number to keep practising {subjectLabel(subject)}.
        Your progress is kept and your other subjects stay free.
      </p>
      <div className="result-actions">
        {onSignIn && (
          <button type="button" className="subject-option" onClick={onSignIn}>
            Sign in
          </button>
        )}
        <button type="button" className="practice-exit" onClick={onBack}>
          Back to subjects
        </button>
      </div>
    </div>
  );
}
