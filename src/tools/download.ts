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

export function registerDownloadTool(server: McpServer): void {
  server.tool(
    "download_image",
    "Download an image from a URL to local disk",
    {
      url: z.string().describe("URL of the image to download"),
      outputPath: z.string().optional().describe("Local file path to save the image (default: ~/Downloads/airforce-{timestamp}.png)"),
    },
    async ({ url, outputPath }) => {
      return withRequestId(async () => {
        logger.info({ tool: "download_image", url }, "tool invoked");
        if (!TRUSTED_DOMAINS.test(url)) return mcpError("Untrusted domain. URL must be from api.airforce, anondrop.net, or *.airforce");
        const resolvedPath = outputPath
          ? outputPath.replace(/^~/, homedir())
          : join(homedir(), "Downloads", `airforce-${Date.now()}.png`);
        try {
          const response = await fetchWithTimeout(url, {});
          if (!response.ok) return mcpError(`Failed to download image: HTTP ${response.status}`);
          const buffer = Buffer.from(await response.arrayBuffer());
          await fs.mkdir(join(resolvedPath, ".."), { recursive: true });
          await fs.writeFile(resolvedPath, buffer);
          logger.info({ path: resolvedPath, bytes: buffer.length }, "image saved");
          return { content: [{ type: "text" as const, text: `Image saved to: ${resolvedPath}` }] };
        } catch (err) {
          return mcpError(`Network error: ${(err as Error).message}`);
        }
      });
    },
  );
}
