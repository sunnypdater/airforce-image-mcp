import { describe, it, expect, beforeEach } from "vitest";
import { mockFetch } from "../helpers/setup.js";

process.env.AIRFORCE_API_KEY = "test-key";

const { registerVideoTool } = await import("../../src/tools/video.js");

function makeServer() {
  const handlers: Record<string, Function> = {};
  return {
    tool: (_name: string, _desc: string, _schema: unknown, handler: Function) => { handlers[_name] = handler; },
    call: (name: string, args: unknown) => handlers[name](args),
  };
}

describe("generate_video tool", () => {
  let server: ReturnType<typeof makeServer>;
  beforeEach(() => { server = makeServer(); registerVideoTool(server as any); });

  it("returns video URL on success", async () => {
    mockFetch([{ status: 200, body: { data: [{ url: "https://anondrop.net/vid.mp4" }] } }]);
    const result = await server.call("generate_video", { prompt: "a cat walking", model: "veo-3.1-fast", aspectRatio: "16:9", resolution: "1K" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain(".mp4");
  });

  it("returns error on 401", async () => {
    mockFetch([{ status: 401, body: "Unauthorized" }]);
    const result = await server.call("generate_video", { prompt: "a cat walking", model: "veo-3.1-fast", aspectRatio: "16:9", resolution: "1K" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Authentication failed");
  });

  it("returns error on empty prompt", async () => {
    const result = await server.call("generate_video", { prompt: "", model: "veo-3.1-fast", aspectRatio: "16:9", resolution: "1K" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("empty");
  });

  it("returns error when API returns no data", async () => {
    mockFetch([{ status: 200, body: { data: [] } }]);
    const result = await server.call("generate_video", { prompt: "a sunset", model: "veo-3.1-fast", aspectRatio: "16:9", resolution: "1K" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("No video");
  });

  it("returns error on network failure", async () => {
    mockFetch([{ status: 200, body: "", throws: true }]);
    const result = await server.call("generate_video", { prompt: "a sunset", model: "veo-3.1-fast", aspectRatio: "16:9", resolution: "1K" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Network error");
  });
});
