"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_EXAM_TRACK, ExamTrack } from "@/domain/exam";
import { SubjectId } from "@/domain/subject";
import { QUESTION_BANK, listSubjects, questionsFor } from "@/domain/bank";
import { loadExamTrack, saveExamTrack } from "@/domain/storage";
import { ExamToggle } from "./ExamToggle";
import { SubjectPicker } from "./SubjectPicker";
import { PracticeScreen } from "./PracticeScreen";

type Stage = "choose" | "practice";

// Owns the Exam Track and the chosen Subject for the home screen, and moves
// the student between choosing and practising.
export function HomeScreen() {
  const [track, setTrack] = useState<ExamTrack>(DEFAULT_EXAM_TRACK);
  const [subject, setSubject] = useState<SubjectId | null>(null);
  const [stage, setStage] = useState<Stage>("choose");

  useEffect(() => {
    setTrack(loadExamTrack(window.localStorage));
  }, []);

  const subjects = useMemo(() => listSubjects(QUESTION_BANK, track), [track]);
  const pool = useMemo(
    () => (subject ? questionsFor(QUESTION_BANK, track, subject) : []),
    [track, subject],
  );

  function selectTrack(next: ExamTrack) {
    setTrack(next);
    setSubject(null);
    setStage("choose");
    saveExamTrack(window.localStorage, next);
  }

  function startPractice(next: SubjectId) {
    setSubject(next);
    setStage("practice");
  }

  function exitPractice() {
    setStage("choose");
  }

  if (stage === "practice") {
    return <PracticeScreen pool={pool} onExit={exitPractice} />;
  }

  return (
    <>
      <ExamToggle track={track} onSelect={selectTrack} />
      <SubjectPicker track={track} subjects={subjects} onSelect={startPractice} />
    </>
  );
}
