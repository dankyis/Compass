"use client";

import { useMemo, useState } from "react";
import { Question, OptionKey, OPTION_KEYS } from "@/domain/question";
import { assemblePracticeSet } from "@/domain/practiceSet";
import { isCorrect } from "@/domain/grading";
import { subjectLabel } from "@/domain/subject";

interface PracticeScreenProps {
  pool: Question[];
  onExit: () => void;
}

// The Practice Loop's core: answer one question at a time and see instantly
// whether you were right, with the correct option revealed.
export function PracticeScreen({ pool, onExit }: PracticeScreenProps) {
  const [set] = useState(() => assemblePracticeSet(pool));
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<OptionKey | null>(null);

  const question = set[index];
  const answered = choice !== null;
  const wasCorrect = useMemo(
    () => (question && choice ? isCorrect(question, choice) : false),
    [question, choice],
  );

  if (!question) {
    return (
      <section className="practice">
        <p className="empty">No questions available for this subject yet.</p>
        <button type="button" className="subject-option" onClick={onExit}>
          Back
        </button>
      </section>
    );
  }

  const isLast = index === set.length - 1;

  function advance() {
    setChoice(null);
    setIndex((i) => i + 1);
  }

  return (
    <section className="practice" aria-label="Practice set">
      <div className="practice-header">
        <span className="practice-progress">
          Question {index + 1} of {set.length}
        </span>
        <span className="practice-subject">{subjectLabel(question.subject)}</span>
      </div>

      <p className="practice-source">{question.source}</p>
      <h2 className="practice-prompt">{question.prompt}</h2>

      <ul className="option-list">
        {question.options.map((text, i) => {
          const key = OPTION_KEYS[i];
          const chosen = choice === key;
          const revealCorrect = answered && key === question.correct;
          const chosenWrong = answered && chosen && key !== question.correct;
          const className = [
            "option",
            revealCorrect ? "correct" : "",
            chosenWrong ? "wrong" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <li key={key}>
              <button
                type="button"
                className={className}
                disabled={answered}
                aria-pressed={chosen}
                onClick={() => setChoice(key)}
              >
                <span className="option-key">{key}</span>
                <span className="option-text">{text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div className="feedback" aria-live="polite">
          <p className="feedback-verdict">
            {wasCorrect ? "Correct" : `Incorrect — the answer is ${question.correct}`}
          </p>
          {question.explanation && (
            <p className="feedback-explanation">{question.explanation}</p>
          )}
          {isLast ? (
            <p className="empty">End of set. Score screen coming in the next ticket.</p>
          ) : (
            <button type="button" className="subject-option" onClick={advance}>
              Next question
            </button>
          )}
        </div>
      )}

      <button type="button" className="practice-exit" onClick={onExit}>
        Exit practice
      </button>
    </section>
  );
}
