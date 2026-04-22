import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockFetch } from "../helpers/setup.js";

process.env.AIRFORCE_API_KEY = "test-key";

const { registerGenerateTool } = await import("../../src/tools/generate.js");

function makeServer() {
  const handlers: Record<string, Function> = {};
  return {
    tool: (_name: string, _desc: string, _schema: unknown, handler: Function) => { handlers[_name] = handler; },
    call: (name: string, args: unknown) => handlers[name](args),
  };
}

describe("generate_image tool", () => {
  let server: ReturnType<typeof makeServer>;
  beforeEach(() => { server = makeServer(); registerGenerateTool(server as any); });

  it("returns image URL on success", async () => {
    mockFetch([{ status: 200, body: { data: [{ url: "https://api.airforce/image/abc.png" }] } }]);
    const result = await server.call("generate_image", { prompt: "a cat", model: "nano-banana-2", n: 1, size: "1024x1024", response_format: "url", aspectRatio: "1:1", resolution: "1K" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("airforce");
  });

  it("returns b64_json image on success", async () => {
    mockFetch([{ status: 200, body: { data: [{ b64_json: "base64data==" }] } }]);
    const result = await server.call("generate_image", { prompt: "a dog", model: "nano-banana-2", n: 1, size: "1024x1024", response_format: "b64_json", aspectRatio: "1:1", resolution: "1K" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("image");
  });

  it("returns error on 401", async () => {
    mockFetch([{ status: 401, body: "Unauthorized" }]);
    const result = await server.call("generate_image", { prompt: "a cat", model: "nano-banana-2", n: 1, size: "1024x1024", response_format: "url", aspectRatio: "1:1", resolution: "1K" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Authentication failed");
  });

  it("returns error on timeout", async () => {
    mockFetch([{ status: 200, body: "", throws: true }]);
    const result = await server.call("generate_image", { prompt: "a cat", model: "nano-banana-2", n: 1, size: "1024x1024", response_format: "url", aspectRatio: "1:1", resolution: "1K" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Network error");
  });

  it("rejects empty prompt", async () => {
    const result = await server.call("generate_image", { prompt: "", model: "nano-banana-2", n: 1, size: "1024x1024", response_format: "url", aspectRatio: "1:1", resolution: "1K" });
    expect(result.isError).toBe(true);
  });
});
