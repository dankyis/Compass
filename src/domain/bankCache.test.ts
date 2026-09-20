import { describe, it, expect } from "vitest";
import {
  BankStore,
  bankCacheKey,
  decodeBank,
  encodeBank,
  loadCachedBank,
  resolveBank,
  saveBank,
} from "./bankCache";
import { Question } from "./question";

function memoryStore(): BankStore {
  const map = new Map<string, string>();
  return {
    async read(key) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    async write(key, value) {
      map.set(key, value);
    },
  };
}

function question(overrides: Partial<Question> = {}): Question {
  return {
    id: "WASSCE-mathematics-fractions-1",
    exam: "WASSCE",
    subject: "mathematics",
    topic: "Fractions",
    prompt: "1/2 + 1/2 = ?",
    options: ["1/2", "1", "2", "0"],
    correct: "B",
    source: "WASSCE June 2017 Qu 11",
    explanation: "Two halves make a whole.",
    ...overrides,
  };
}

const pool: Question[] = [question(), question({ id: "q2" })];

describe("bankCacheKey", () => {
  it("is distinct per track and subject", () => {
    expect(bankCacheKey("WASSCE", "mathematics")).not.toBe(
      bankCacheKey("BECE", "mathematics"),
    );
    expect(bankCacheKey("WASSCE", "mathematics")).not.toBe(
      bankCacheKey("WASSCE", "english"),
    );
  });
});

describe("encode/decode", () => {
  it("round-trips a valid bank", () => {
    expect(decodeBank(encodeBank(pool))).toEqual(pool);
  });

  it("rejects a missing or empty cache", () => {
    expect(decodeBank(null)).toBeNull();
    expect(decodeBank("[]")).toBeNull();
  });

  it("rejects malformed JSON", () => {
    expect(decodeBank("{not json")).toBeNull();
  });

  it("rejects a row with the wrong number of options", () => {
    const bad = JSON.stringify([{ ...question(), options: ["1", "2", "3"] }]);
    expect(decodeBank(bad)).toBeNull();
  });

  it("rejects a row with an invalid correct option", () => {
    const bad = JSON.stringify([{ ...question(), correct: "E" }]);
    expect(decodeBank(bad)).toBeNull();
  });
});

describe("load/save", () => {
  it("returns null when nothing is cached", async () => {
    expect(await loadCachedBank(memoryStore(), "WASSCE", "mathematics")).toBeNull();
  });

  it("reads back what was saved", async () => {
    const store = memoryStore();
    await saveBank(store, "WASSCE", "mathematics", pool);
    expect(await loadCachedBank(store, "WASSCE", "mathematics")).toEqual(pool);
  });

  it("keeps subjects separate", async () => {
    const store = memoryStore();
    await saveBank(store, "WASSCE", "mathematics", pool);
    expect(await loadCachedBank(store, "WASSCE", "english")).toBeNull();
  });
});

describe("resolveBank", () => {
  it("caches the pool on first use", async () => {
    const store = memoryStore();
    const resolved = await resolveBank(store, "WASSCE", "mathematics", pool);
    expect(resolved).toEqual(pool);
    expect(await loadCachedBank(store, "WASSCE", "mathematics")).toEqual(pool);
  });

  it("prefers the cached bank over the pool", async () => {
    const store = memoryStore();
    await saveBank(store, "WASSCE", "mathematics", [question({ id: "cached" })]);
    const resolved = await resolveBank(store, "WASSCE", "mathematics", pool);
    expect(resolved.map((q) => q.id)).toEqual(["cached"]);
  });

  it("does not cache an empty pool", async () => {
    const store = memoryStore();
    const resolved = await resolveBank(store, "WASSCE", "english", []);
    expect(resolved).toEqual([]);
    expect(await loadCachedBank(store, "WASSCE", "english")).toBeNull();
  });
});
