"use client";

import { useEffect, useMemo, useState } from "react";
import { Question, OptionKey, OPTION_KEYS } from "@/domain/question";
import { assemblePracticeSet } from "@/domain/practiceSet";
import { isCorrect, summarise, missedQuestions } from "@/domain/grading";
import { subjectLabel } from "@/domain/subject";
import {
  formatDuration,
  isExpired,
  remainingSeconds,
  timeLimitMillis,
} from "@/domain/examMode";

interface PracticeScreenProps {
  pool: Question[];
  onExit: () => void;
}

// The Practice Loop's core: answer one question at a time, see instantly
// whether you were right, then get a score and a review of what you missed.
// Practice is untimed unless the student turns on Exam Mode.
export function PracticeScreen({ pool, onExit }: PracticeScreenProps) {
  const [questions, setQuestions] = useState<Question[]>(() =>
    assemblePracticeSet(pool),
  );
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<OptionKey | null>(null);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [finished, setFinished] = useState(false);

  // Exam Mode: off by default; when on, a deadline ends the set on time.
  const [examMode, setExamMode] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [timedOut, setTimedOut] = useState(false);

  const question = questions[index];
  const answered = choice !== null;
  const wasCorrect = useMemo(
    () => (question && choice ? isCorrect(question, choice) : false),
    [question, choice],
  );

  const result = useMemo(() => summarise(questions, answers), [questions, answers]);
  const missed = useMemo(() => missedQuestions(questions, answers), [questions, answers]);

  const remaining = deadline === null ? null : remainingSeconds(deadline, now);

  // Tick the countdown while a deadline is set.
  useEffect(() => {
    if (deadline === null || finished) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline, finished]);

  // Reaching the limit ends the set and shows the score.
  useEffect(() => {
    if (deadline !== null && !finished && isExpired(deadline, now)) {
      setTimedOut(true);
      setFinished(true);
    }
  }, [deadline, now, finished]);

  function setTimer(on: boolean) {
    setExamMode(on);
    if (on) {
      const started = Date.now();
      setNow(started);
      setDeadline(started + timeLimitMillis(questions.length));
    } else {
      setDeadline(null);
    }
  }

  function startRun(next: Question[]) {
    setQuestions(next);
    setIndex(0);
    setChoice(null);
    setAnswers({});
    setFinished(false);
    setTimedOut(false);
    if (examMode) {
      const started = Date.now();
      setNow(started);
      setDeadline(started + timeLimitMillis(next.length));
    }
  }

  function choose(key: OptionKey) {
    if (!question) return;
    setChoice(key);
    setAnswers((prev) => ({ ...prev, [question.id]: key }));
  }

  function advance() {
    setChoice(null);
    setIndex((i) => i + 1);
  }

  if (questions.length === 0) {
    return (
      <section className="practice">
        <p className="empty">No questions available for this subject yet.</p>
        <button type="button" className="subject-option" onClick={onExit}>
          Back
        </button>
      </section>
    );
  }

  if (finished) {
    return (
      <section className="practice" aria-label="Practice results">
        <h2 className="practice-prompt">
          {timedOut ? "Time's up — " : ""}You scored {result.correct} out of{" "}
          {result.total}
        </h2>

        {missed.length > 0 ? (
          <div className="review">
            <h3>Review what you missed</h3>
            <ul className="review-list">
              {missed.map((q) => (
                <li key={q.id} className="review-item">
                  <p className="review-prompt">{q.prompt}</p>
                  <p className="review-answer">
                    Correct answer: <strong>{q.correct}</strong> — {
                      q.options[OPTION_KEYS.indexOf(q.correct)]
                    }
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="feedback-verdict">Perfect set — nothing missed.</p>
        )}

        <div className="result-actions">
          {missed.length > 0 && (
            <button
              type="button"
              className="subject-option"
              onClick={() => startRun(missed)}
            >
              Retry missed ({missed.length})
            </button>
          )}
          <button
            type="button"
            className="subject-option"
            onClick={() => startRun(assemblePracticeSet(pool))}
          >
            Next set
          </button>
          <button type="button" className="practice-exit" onClick={onExit}>
            Exit practice
          </button>
        </div>
      </section>
    );
  }

  if (!question) return null;
  const isLast = index === questions.length - 1;

  return (
    <section className="practice" aria-label="Practice set">
      <div className="practice-header">
        <span className="practice-progress">
          Question {index + 1} of {questions.length}
        </span>
        <span className="practice-subject">{subjectLabel(question.subject)}</span>
      </div>

      <div className="exam-mode">
        <button
          type="button"
          className={`exam-mode-toggle${examMode ? " active" : ""}`}
          aria-pressed={examMode}
          onClick={() => setTimer(!examMode)}
        >
          {examMode ? "Exam Mode on" : "Exam Mode off"}
        </button>
        {remaining !== null && (
          <span className="exam-timer" aria-live="off">
            Time left {formatDuration(remaining)}
          </span>
        )}
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
                onClick={() => choose(key)}
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
            <button
              type="button"
              className="subject-option"
              onClick={() => setFinished(true)}
            >
              See results
            </button>
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
