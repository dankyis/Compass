import { describe, it, expect } from "vitest";
import { createDevPhoneAuth, isValidCode, normalizePhone } from "./auth";

describe("normalizePhone", () => {
  it("accepts a local 0-prefixed number", () => {
    expect(normalizePhone("0244123456")).toBe("+233244123456");
  });

  it("accepts country-code and plus forms", () => {
    expect(normalizePhone("233244123456")).toBe("+233244123456");
    expect(normalizePhone("+233244123456")).toBe("+233244123456");
  });

  it("tolerates spaces and dashes", () => {
    expect(normalizePhone("024 412-3456")).toBe("+233244123456");
  });

  it("rejects numbers that are too short or too long", () => {
    expect(normalizePhone("024412345")).toBeNull();
    expect(normalizePhone("02441234567")).toBeNull();
  });

  it("rejects empty or junk input", () => {
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("not a phone")).toBeNull();
  });
});

describe("isValidCode", () => {
  it("accepts exactly six digits", () => {
    expect(isValidCode("123456")).toBe(true);
    expect(isValidCode(" 123456 ")).toBe(true);
  });

  it("rejects other shapes", () => {
    expect(isValidCode("12345")).toBe(false);
    expect(isValidCode("1234567")).toBe(false);
    expect(isValidCode("12345a")).toBe(false);
  });
});

describe("createDevPhoneAuth", () => {
  it("returns a session for a valid phone and code", async () => {
    const auth = createDevPhoneAuth();
    await auth.requestCode("0244123456");
    expect(await auth.verifyCode("0244123456", "123456")).toEqual({
      phone: "+233244123456",
    });
  });

  it("rejects a bad phone or bad code", async () => {
    const auth = createDevPhoneAuth();
    expect(await auth.verifyCode("nope", "123456")).toBeNull();
    expect(await auth.verifyCode("0244123456", "12")).toBeNull();
  });
});
