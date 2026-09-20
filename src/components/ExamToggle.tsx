"use client";

import { EXAM_TRACKS, ExamTrack, examTrackLabel } from "@/domain/exam";

interface ExamToggleProps {
  track: ExamTrack;
  onSelect: (track: ExamTrack) => void;
}

// Presentational Exam Toggle. The selected track is owned by the caller so
// other parts of the screen (the subject picker) can react to it.
export function ExamToggle({ track, onSelect }: ExamToggleProps) {
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
            onClick={() => onSelect(candidate)}
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
