import { describe, it, expect } from "vitest";
import { isCorrect, summarise, missedQuestions } from "./grading";
import { Question } from "./question";

const questions: Question[] = [
  { id: "q1", exam: "WASSCE", subject: "mathematics", topic: "T", prompt: "a", options: ["1","2","3","4"], correct: "A", source: "s", explanation: "" },
  { id: "q2", exam: "WASSCE", subject: "mathematics", topic: "T", prompt: "b", options: ["1","2","3","4"], correct: "B", source: "s", explanation: "" },
  { id: "q3", exam: "WASSCE", subject: "mathematics", topic: "T", prompt: "c", options: ["1","2","3","4"], correct: "C", source: "s", explanation: "" },
];

describe("isCorrect", () => {
  it("is true only for the correct option", () => {
    expect(isCorrect(questions[0], "A")).toBe(true);
    expect(isCorrect(questions[0], "B")).toBe(false);
  });
});

describe("summarise", () => {
  it("counts correct answers", () => {
    expect(summarise(questions, { q1: "A", q2: "B", q3: "C" })).toEqual({ total: 3, correct: 3 });
  });

  it("counts unanswered questions as incorrect", () => {
    expect(summarise(questions, { q1: "A" })).toEqual({ total: 3, correct: 1 });
  });

  it("counts wrong answers as incorrect", () => {
    expect(summarise(questions, { q1: "D", q2: "B", q3: "A" })).toEqual({ total: 3, correct: 1 });
  });
});

describe("missedQuestions", () => {
  it("returns nothing when everything is correct", () => {
    expect(missedQuestions(questions, { q1: "A", q2: "B", q3: "C" })).toEqual([]);
  });

  it("returns wrongly answered questions", () => {
    const missed = missedQuestions(questions, { q1: "A", q2: "C", q3: "C" });
    expect(missed.map((q) => q.id)).toEqual(["q2"]);
  });

  it("returns unanswered questions too", () => {
    const missed = missedQuestions(questions, { q1: "A" });
    expect(missed.map((q) => q.id)).toEqual(["q2", "q3"]);
  });
});
