"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_EXAM_TRACK, ExamTrack } from "@/domain/exam";
import { SubjectId } from "@/domain/subject";
import { Question } from "@/domain/question";
import { SetResult } from "@/domain/grading";
import {
  QUESTION_BANK,
  listSubjects,
  questionsFor,
  topicsFor,
} from "@/domain/bank";
import { resolveBank } from "@/domain/bankCache";
import { createBrowserBankStore } from "@/lib/browserBankStore";
import {
  loadExamTrack,
  loadProgress,
  saveExamTrack,
  saveProgress,
} from "@/domain/storage";
import { EMPTY_PROGRESS, Progress, recordSet, toDayKey } from "@/domain/progress";
import { ExamToggle } from "./ExamToggle";
import { SubjectPicker } from "./SubjectPicker";
import { TopicPicker } from "./TopicPicker";
import { PracticeScreen } from "./PracticeScreen";
import { ProgressSummary } from "./ProgressSummary";

type Stage = "choose" | "topic" | "practice";

// Owns the Exam Track, the chosen Subject, the optional Topic filter and the
// on-device Progress for the home screen, and moves the student between
// choosing and practising.
export function HomeScreen() {
  const [track, setTrack] = useState<ExamTrack>(DEFAULT_EXAM_TRACK);
  const [subject, setSubject] = useState<SubjectId | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("choose");
  const [pool, setPool] = useState<Question[]>([]);
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);

  const store = useMemo(() => createBrowserBankStore(), []);

  useEffect(() => {
    setTrack(loadExamTrack(window.localStorage));
    setProgress(loadProgress(window.localStorage));
  }, []);

  const subjects = useMemo(() => listSubjects(QUESTION_BANK, track), [track]);
  const topics = useMemo(
    () => (subject ? topicsFor(QUESTION_BANK, track, subject) : []),
    [track, subject],
  );

  // Cache every subject bank for the chosen track, so a set runs with no network.
  useEffect(() => {
    for (const candidate of subjects) {
      void resolveBank(
        store,
        track,
        candidate,
        questionsFor(QUESTION_BANK, track, candidate),
      ).catch(() => {
        // A cache failure is non-fatal; the bundled bank still works.
      });
    }
  }, [store, track, subjects]);

  const recordCompletedSet = useCallback(
    (doneSubject: SubjectId, result: SetResult) => {
      setProgress((previous) => {
        const next = recordSet(previous, doneSubject, result, toDayKey(new Date()));
        saveProgress(window.localStorage, next);
        return next;
      });
    },
    [],
  );

  function selectTrack(next: ExamTrack) {
    setTrack(next);
    setSubject(null);
    setTopic(null);
    setStage("choose");
    saveExamTrack(window.localStorage, next);
  }

  function chooseSubject(next: SubjectId) {
    setSubject(next);
    setTopic(null);
    setStage("topic");
  }

  async function startPractice(nextTopic: string | null) {
    if (!subject) return;
    const bank = await resolveBank(
      store,
      track,
      subject,
      questionsFor(QUESTION_BANK, track, subject),
    ).catch(() => questionsFor(QUESTION_BANK, track, subject));
    setTopic(nextTopic);
    setPool(nextTopic ? bank.filter((q) => q.topic === nextTopic) : bank);
    setStage("practice");
  }

  function backToSubjects() {
    setSubject(null);
    setTopic(null);
    setStage("choose");
  }

  function exitPractice() {
    setStage("topic");
  }

  if (stage === "practice") {
    return (
      <PracticeScreen
        pool={pool}
        onExit={exitPractice}
        onSetComplete={recordCompletedSet}
      />
    );
  }

  if (stage === "topic" && subject) {
    return (
      <>
        <ExamToggle track={track} onSelect={selectTrack} />
        <TopicPicker
          subject={subject}
          topics={topics}
          onSelect={startPractice}
          onBack={backToSubjects}
        />
      </>
    );
  }

  return (
    <>
      <ExamToggle track={track} onSelect={selectTrack} />
      <SubjectPicker track={track} subjects={subjects} onSelect={chooseSubject} />
      <ProgressSummary progress={progress} />
    </>
  );
}
