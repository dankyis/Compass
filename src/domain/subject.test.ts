import { describe, it, expect } from "vitest";
import { isSubjectId, subjectLabel, SUBJECTS } from "./subject";

describe("subject", () => {
  it("accepts every known subject", () => {
    for (const subject of SUBJECTS) expect(isSubjectId(subject)).toBe(true);
  });

  it("rejects unknown or non-string values", () => {
    expect(isSubjectId("history")).toBe(false);
    expect(isSubjectId(null)).toBe(false);
    expect(isSubjectId(42)).toBe(false);
  });

  it("labels a subject for display", () => {
    expect(subjectLabel("mathematics")).toBe("Core Mathematics");
    expect(subjectLabel("english")).toBe("English Language");
  });
});
