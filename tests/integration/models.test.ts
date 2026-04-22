import { describe, it, expect, beforeEach } from "vitest";
import { mockFetch } from "../helpers/setup.js";

process.env.AIRFORCE_API_KEY = "test-key";

const { registerModelTools } = await import("../../src/tools/models.js");

function makeServer() {
  const handlers: Record<string, Function> = {};
  return {
    tool: (_name: string, _desc: string, _schema: unknown, handler: Function) => { handlers[_name] = handler; },
    call: (name: string, args: unknown) => handlers[name](args),
  };
}

describe("list_models tool", () => {
  let server: ReturnType<typeof makeServer>;
  beforeEach(() => { server = makeServer(); registerModelTools(server as any); });

  it("returns model list on success", async () => {
    mockFetch([{ status: 200, body: { data: [{ id: "model-a" }, { id: "model-b" }] } }]);
    const result = await server.call("list_models", {});
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("model-a");
    expect(result.content[0].text).toContain("model-b");
  });

  it("returns error on API failure", async () => {
    mockFetch([{ status: 500, body: "Internal Server Error" }]);
    const result = await server.call("list_models", {});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("API error 500");
  });

  it("returns error on network failure", async () => {
    mockFetch([{ status: 0, body: "connection refused", throws: true }]);
    const result = await server.call("list_models", {});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Network error");
  });
});
