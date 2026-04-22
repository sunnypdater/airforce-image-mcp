import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mockFetch } from "../helpers/setup.js";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";

process.env.AIRFORCE_API_KEY = "test-key";

const { registerDownloadVideoTool } = await import("../../src/tools/download-video.js");

function makeServer() {
  const handlers: Record<string, Function> = {};
  return {
    tool: (_name: string, _desc: string, _schema: unknown, handler: Function) => { handlers[_name] = handler; },
    call: (name: string, args: unknown) => handlers[name](args),
  };
}

describe("download_video tool", () => {
  let server: ReturnType<typeof makeServer>;
  let tmpFile: string;

  beforeEach(() => { server = makeServer(); registerDownloadVideoTool(server as any); tmpFile = join(tmpdir(), `test-video-${Date.now()}.mp4`); });
  afterEach(async () => { await fs.unlink(tmpFile).catch(() => {}); });

  it("downloads and saves video successfully", async () => {
    const fakeVideoData = Buffer.from("MP4_DATA");
    global.fetch = async () => new Response(fakeVideoData, { status: 200, headers: { "Content-Type": "video/mp4" } });
    const result = await server.call("download_video", { url: "https://anondrop.net/vid.mp4", outputPath: tmpFile });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain(tmpFile);
    const saved = await fs.readFile(tmpFile);
    expect(saved.length).toBeGreaterThan(0);
  });

  it("rejects untrusted domain", async () => {
    const result = await server.call("download_video", { url: "https://evil.com/video.mp4", outputPath: tmpFile });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Untrusted domain");
  });

  it("returns error on failed download", async () => {
    mockFetch([{ status: 404, body: "Not Found" }]);
    const result = await server.call("download_video", { url: "https://anondrop.net/missing.mp4", outputPath: tmpFile });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Failed to download");
  });
});
