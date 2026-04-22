import { describe, it, expect } from "vitest";
import { AirforceError, NetworkError, ValidationError, mcpError } from "../../src/errors.js";

describe("mcpError", () => {
  it("returns isError true", () => { expect(mcpError("something went wrong").isError).toBe(true); });
  it("returns text content with message", () => {
    const result = mcpError("test error");
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe("test error");
  });
});

describe("AirforceError", () => {
  it("has correct name", () => {
    const err = new AirforceError("api failed", 500);
    expect(err.name).toBe("AirforceError");
    expect(err.message).toBe("api failed");
    expect(err.status).toBe(500);
  });
});

describe("NetworkError", () => {
  it("has correct name", () => {
    const err = new NetworkError("connection refused");
    expect(err.name).toBe("NetworkError");
    expect(err.message).toBe("connection refused");
  });
});

describe("ValidationError", () => {
  it("has correct name", () => {
    const err = new ValidationError("invalid input");
    expect(err.name).toBe("ValidationError");
    expect(err.message).toBe("invalid input");
  });
});
