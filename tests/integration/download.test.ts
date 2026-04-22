import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mockFetch } from "../helpers/setup.js";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";

process.env.AIRFORCE_API_KEY = "test-key";

const { registerDownloadTool } = await import("../../src/tools/download.js");

function makeServer() {
  const handlers: Record<string, Function> = {};
  return {
    tool: (_name: string, _desc: string, _schema: unknown, handler: Function) => { handlers[_name] = handler; },
    call: (name: string, args: unknown) => handlers[name](args),
  };
}

describe("download_image tool", () => {
  let server: ReturnType<typeof makeServer>;
  let tmpFile: string;

  beforeEach(() => { server = makeServer(); registerDownloadTool(server as any); tmpFile = join(tmpdir(), `test-download-${Date.now()}.png`); });
  afterEach(async () => { await fs.unlink(tmpFile).catch(() => {}); });

  it("downloads and saves image successfully", async () => {
    const fakeImageData = Buffer.from("PNG_DATA");
    global.fetch = async () => new Response(fakeImageData, { status: 200, headers: { "Content-Type": "image/png" } });
    const result = await server.call("download_image", { url: "https://api.airforce/image/test.png", outputPath: tmpFile });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain(tmpFile);
    const saved = await fs.readFile(tmpFile);
    expect(saved.length).toBeGreaterThan(0);
  });

  it("rejects untrusted domain", async () => {
    const result = await server.call("download_image", { url: "https://evil.com/image.png", outputPath: tmpFile });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Untrusted domain");
  });

  it("returns error on failed download", async () => {
    mockFetch([{ status: 404, body: "Not Found" }]);
    const result = await server.call("download_image", { url: "https://api.airforce/image/missing.png", outputPath: tmpFile });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Failed to download");
  });
});
