import { describe, it, expect } from "vitest";
import { validatePrompt, validatePromptWithParams } from "../../src/validation.js";

describe("validatePrompt", () => {
  it("rejects empty string", () => { expect(validatePrompt("").valid).toBe(false); });
  it("rejects whitespace-only string", () => { expect(validatePrompt("   ").valid).toBe(false); });
  it("rejects prompt over 4000 chars", () => { expect(validatePrompt("a".repeat(4001)).valid).toBe(false); });
  it("accepts prompt at exactly 4000 chars", () => { expect(validatePrompt("a".repeat(4000)).valid).toBe(true); });
  it("rejects null bytes", () => { expect(validatePrompt("hello\x00world").valid).toBe(false); });
  it("rejects other control chars", () => { expect(validatePrompt("hello\x01world").valid).toBe(false); });
  it("allows newlines and tabs", () => { expect(validatePrompt("hello\nworld\ttab").valid).toBe(true); });
  it("accepts valid prompt", () => {
    const result = validatePrompt("A beautiful sunset over the ocean");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe("validatePromptWithParams", () => {
  it("warns on n=4 and resolution=4K", () => {
    const result = validatePromptWithParams("test prompt", 4, "4K");
    expect(result.valid).toBe(true);
    expect(result.warning).toBeDefined();
  });
  it("no warning for n=4 and resolution=1K", () => {
    const result = validatePromptWithParams("test prompt", 4, "1K");
    expect(result.valid).toBe(true);
    expect(result.warning).toBeUndefined();
  });
  it("propagates base validation errors", () => {
    const result = validatePromptWithParams("", 1, "1K");
    expect(result.valid).toBe(false);
  });
});
