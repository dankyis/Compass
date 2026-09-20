"use client";

import { useEffect, useState } from "react";
import {
  EXAM_TRACKS,
  ExamTrack,
  DEFAULT_EXAM_TRACK,
  examTrackLabel,
} from "@/domain/exam";
import { loadExamTrack, saveExamTrack } from "@/domain/storage";

export function ExamToggle() {
  const [track, setTrack] = useState<ExamTrack>(DEFAULT_EXAM_TRACK);

  // Read the saved track on mount so the choice survives reloads.
  useEffect(() => {
    setTrack(loadExamTrack(window.localStorage));
  }, []);

  function select(next: ExamTrack) {
    setTrack(next);
    saveExamTrack(window.localStorage, next);
  }

  return (
    <section className="toggle-section" aria-label="Choose your exam">
      <div className="toggle" role="radiogroup" aria-label="Exam track">
        {EXAM_TRACKS.map((candidate) => (
          <button
            key={candidate}
            type="button"
            role="radio"
            aria-checked={track === candidate}
            className={
              track === candidate ? "toggle-option active" : "toggle-option"
            }
            onClick={() => select(candidate)}
          >
            {examTrackLabel(candidate)}
          </button>
        ))}
      </div>
      <p className="selected" aria-live="polite">
        You are practising: <strong>{examTrackLabel(track)}</strong>
      </p>
    </section>
  );
}
