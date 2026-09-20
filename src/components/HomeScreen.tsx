"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_EXAM_TRACK, ExamTrack } from "@/domain/exam";
import { SubjectId, subjectLabel } from "@/domain/subject";
import { QUESTION_BANK, listSubjects } from "@/domain/bank";
import { loadExamTrack, saveExamTrack } from "@/domain/storage";
import { ExamToggle } from "./ExamToggle";
import { SubjectPicker } from "./SubjectPicker";

// Owns the Exam Track for the home screen so the subject picker can react
// to it, and persists the choice so it survives reloads.
export function HomeScreen() {
  const [track, setTrack] = useState<ExamTrack>(DEFAULT_EXAM_TRACK);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | null>(null);

  useEffect(() => {
    setTrack(loadExamTrack(window.localStorage));
  }, []);

  const subjects = useMemo(
    () => listSubjects(QUESTION_BANK, track),
    [track],
  );

  function selectTrack(next: ExamTrack) {
    setTrack(next);
    setSelectedSubject(null);
    saveExamTrack(window.localStorage, next);
  }

  return (
    <>
      <ExamToggle track={track} onSelect={selectTrack} />
      <SubjectPicker
        track={track}
        subjects={subjects}
        onSelect={setSelectedSubject}
      />
      {selectedSubject && (
        <p className="selected" aria-live="polite">
          You are practising: <strong>{subjectLabel(selectedSubject)}</strong>
        </p>
      )}
    </>
  );
}
