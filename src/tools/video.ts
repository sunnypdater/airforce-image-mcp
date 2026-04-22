import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchWithTimeout } from "../http.js";
import { mcpError } from "../errors.js";
import { validatePrompt } from "../validation.js";
import { withRequestId } from "../context.js";
import { logger } from "../logger.js";

const API_BASE = "https://api.airforce/v1";
const VIDEO_MODELS = ["veo-3.1-fast"] as const;

export function registerVideoTool(server: McpServer): void {
  server.tool(
    "generate_video",
    "Generate a video using the Airforce video generation API",
    {
      prompt: z.string().describe("Text prompt describing the video to generate"),
      model: z.enum(VIDEO_MODELS).optional().default("veo-3.1-fast").describe("Video model to use"),
      aspectRatio: z.enum(["16:9", "9:16", "1:1"]).optional().default("16:9").describe("Aspect ratio of the video"),
      resolution: z.enum(["1K", "2K"]).optional().default("1K").describe("Video resolution"),
    },
    async ({ prompt, model, aspectRatio, resolution }) => {
      return withRequestId(async () => {
        logger.info({ tool: "generate_video", prompt: prompt.slice(0, 80), model }, "tool invoked");
        const validation = validatePrompt(prompt);
        if (!validation.valid) return mcpError(validation.error!);
        const apiKey = process.env.AIRFORCE_API_KEY!;
        try {
          const response = await fetchWithTimeout(`${API_BASE}/images/generations`, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model, prompt, n: 1, response_format: "url", sse: false, aspectRatio, resolution }),
          });
          if (response.status === 401) return mcpError("Authentication failed — check AIRFORCE_API_KEY");
          if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After") ?? "unknown";
            return mcpError(`Rate limit exceeded — retry after ${retryAfter}s`);
          }
          if (!response.ok) return mcpError(`API error ${response.status}: ${await response.text()}`);
          const data = (await response.json()) as { data?: Array<{ url?: string }> };
          const url = data.data?.[0]?.url;
          if (!url) return mcpError("No video returned from API");
          return { content: [{ type: "text" as const, text: url }] };
        } catch (err) {
          return mcpError(`Network error: ${(err as Error).message}`);
        }
      });
    },
  );
}
