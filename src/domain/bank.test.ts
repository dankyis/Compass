import { describe, it, expect } from "vitest";
import { buildBank, listSubjects, questionsFor, topicsFor } from "./bank";
import { SeedTopic } from "./seed";

const seed: SeedTopic[] = [
  {
    exam: "WASSCE",
    subject: "mathematics",
    topic: "Algebraic Expressions",
    questions: [
      { prompt: "Q1", options: ["1", "2", "3", "4"], correct: "A", source: "S1" },
      { prompt: "Q2", options: ["1", "2", "3", "4"], correct: "B", source: "S2" },
    ],
  },
  {
    exam: "BECE",
    subject: "english",
    topic: "Comprehension",
    questions: [
      { prompt: "Q3", options: ["1", "2", "3", "4"], correct: "C", source: "S3" },
    ],
  },
];

describe("buildBank", () => {
  it("flattens seed topics into questions", () => {
    expect(buildBank(seed)).toHaveLength(3);
  });

  it("derives stable ids and defaults explanation to empty", () => {
    const [first] = buildBank(seed);
    expect(first.id).toBe("WASSCE-mathematics-algebraic-expressions-1");
    expect(first.explanation).toBe("");
    expect(first.exam).toBe("WASSCE");
    expect(first.topic).toBe("Algebraic Expressions");
  });

  it("keeps an authored explanation when present", () => {
    const withExplanation: SeedTopic[] = [
      { ...seed[0], questions: [{ ...seed[0].questions[0], explanation: "because" }] },
    ];
    expect(buildBank(withExplanation)[0].explanation).toBe("because");
  });

  it("rejects a question without exactly four options", () => {
    const bad: SeedTopic[] = [
      { ...seed[0], questions: [{ prompt: "x", options: ["1", "2", "3"], correct: "A", source: "s" }] },
    ];
    expect(() => buildBank(bad)).toThrow(/exactly 4 options/);
  });
});

describe("bank queries", () => {
  const bank = buildBank(seed);

  it("lists subjects for a track, in first-seen order", () => {
    expect(listSubjects(bank, "WASSCE")).toEqual(["mathematics"]);
    expect(listSubjects(bank, "BECE")).toEqual(["english"]);
  });

  it("returns no subjects for a track with no content", () => {
    expect(listSubjects(bank, "WASSCE")).not.toContain("english");
  });

  it("filters questions by exam and subject", () => {
    expect(questionsFor(bank, "WASSCE", "mathematics")).toHaveLength(2);
    expect(questionsFor(bank, "BECE", "mathematics")).toHaveLength(0);
  });

  it("lists distinct topics within a subject", () => {
    expect(topicsFor(bank, "WASSCE", "mathematics")).toEqual(["Algebraic Expressions"]);
  });
});
