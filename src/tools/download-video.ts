import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchWithTimeout } from "../http.js";
import { mcpError } from "../errors.js";
import { withRequestId } from "../context.js";
import { logger } from "../logger.js";
import { promises as fs } from "fs";
import { homedir } from "os";
import { join } from "path";

const TRUSTED_DOMAINS = /^https:\/\/(\w[\w-]*\.)?airforce(\/|$)|^https:\/\/anondrop\.net(\/|$)/;

export function registerDownloadVideoTool(server: McpServer): void {
  server.tool(
    "download_video",
    "Download a generated video (mp4) from a URL to local disk",
    {
      url: z.string().describe("URL of the video to download (must be from a trusted domain)"),
      outputPath: z.string().optional().describe("Local file path to save the video (default: ~/Downloads/airforce-{timestamp}.mp4)"),
    },
    async ({ url, outputPath }) => {
      return withRequestId(async () => {
        logger.info({ tool: "download_video", url }, "tool invoked");
        if (!TRUSTED_DOMAINS.test(url)) return mcpError("Untrusted domain. URL must be from api.airforce, anondrop.net, or *.airforce");
        const resolvedPath = outputPath
          ? outputPath.replace(/^~/, homedir())
          : join(homedir(), "Downloads", `airforce-${Date.now()}.mp4`);
        try {
          const response = await fetchWithTimeout(url, {});
          if (!response.ok) return mcpError(`Failed to download video: HTTP ${response.status}`);
          const buffer = Buffer.from(await response.arrayBuffer());
          await fs.mkdir(join(resolvedPath, ".."), { recursive: true });
          await fs.writeFile(resolvedPath, buffer);
          logger.info({ path: resolvedPath, bytes: buffer.length }, "video saved");
          return { content: [{ type: "text" as const, text: `Video saved to: ${resolvedPath}` }] };
        } catch (err) {
          return mcpError(`Network error: ${(err as Error).message}`);
        }
      });
    },
  );
}
