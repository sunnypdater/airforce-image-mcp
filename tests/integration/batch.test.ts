import { describe, it, expect, beforeEach } from "vitest";
import { mockFetch } from "../helpers/setup.js";

process.env.AIRFORCE_API_KEY = "test-key";

const { registerBatchTool } = await import("../../src/tools/batch.js");

function makeServer() {
  const handlers: Record<string, Function> = {};
  return {
    tool: (_name: string, _desc: string, _schema: unknown, handler: Function) => { handlers[_name] = handler; },
    call: (name: string, args: unknown) => handlers[name](args),
  };
}

describe("batch_generate tool", () => {
  let server: ReturnType<typeof makeServer>;
  beforeEach(() => { server = makeServer(); registerBatchTool(server as any); });

  it("generates 3 prompts sequentially", async () => {
    mockFetch([
      { status: 200, body: { data: [{ url: "https://api.airforce/img/1.png" }] } },
      { status: 200, body: { data: [{ url: "https://api.airforce/img/2.png" }] } },
      { status: 200, body: { data: [{ url: "https://api.airforce/img/3.png" }] } },
    ]);
    const result = await server.call("batch_generate", { prompts: ["cat", "dog", "bird"], model: "nano-banana-2", size: "1024x1024", aspectRatio: "1:1", resolution: "1K" });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toHaveLength(3);
    expect(parsed[0].url).toContain("1.png");
  });

  it("handles partial failure gracefully", async () => {
    mockFetch([
      { status: 200, body: { data: [{ url: "https://api.airforce/img/1.png" }] } },
      { status: 500, body: "Server Error" },
      { status: 200, body: { data: [{ url: "https://api.airforce/img/3.png" }] } },
    ]);
    const result = await server.call("batch_generate", { prompts: ["cat", "dog", "bird"], model: "nano-banana-2", size: "1024x1024", aspectRatio: "1:1", resolution: "1K" });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed[0].url).toBeDefined();
    expect(parsed[1].error).toBeDefined();
    expect(parsed[2].url).toBeDefined();
  });

  it("marks invalid prompts as errors without calling API", async () => {
    mockFetch([{ status: 200, body: { data: [{ url: "https://api.airforce/img/1.png" }] } }]);
    const result = await server.call("batch_generate", { prompts: ["valid prompt", ""], model: "nano-banana-2", size: "1024x1024", aspectRatio: "1:1", resolution: "1K" });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed[0].url).toBeDefined();
    expect(parsed[1].error).toContain("empty");
  });
});
