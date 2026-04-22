import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchWithTimeout } from "../http.js";
import { validatePrompt } from "../validation.js";
import { withRequestId } from "../context.js";
import { logger } from "../logger.js";

const API_BASE = "https://api.airforce/v1";

export function registerBatchTool(server: McpServer): void {
  server.tool(
    "batch_generate",
    "Generate images for multiple prompts sequentially",
    {
      prompts: z.array(z.string()).min(1).max(5).describe("Array of 1–5 prompts to generate images for"),
      model: z.string().optional().default("nano-banana-2").describe("Model to use"),
      size: z.enum(["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]).optional().default("1024x1024").describe("Image size"),
      aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).optional().default("1:1").describe("Aspect ratio"),
      resolution: z.enum(["1K", "2K", "4K"]).optional().default("1K").describe("Resolution"),
    },
    async ({ prompts, model, size, aspectRatio, resolution }) => {
      return withRequestId(async () => {
        logger.info({ tool: "batch_generate", count: prompts.length }, "tool invoked");
        const apiKey = process.env.AIRFORCE_API_KEY!;
        const results: Array<{ prompt: string; url?: string; error?: string }> = [];
        for (const prompt of prompts) {
          const validation = validatePrompt(prompt);
          if (!validation.valid) { results.push({ prompt, error: validation.error }); continue; }
          try {
            const response = await fetchWithTimeout(`${API_BASE}/images/generations`, {
              method: "POST",
              headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({ model, prompt, n: 1, size, response_format: "url", sse: false, aspectRatio, resolution }),
            });
            if (!response.ok) { results.push({ prompt, error: `API error ${response.status}: ${await response.text()}` }); continue; }
            const data = (await response.json()) as { data?: Array<{ url?: string }> };
            const url = data.data?.[0]?.url;
            results.push({ prompt, url: url ?? undefined, error: url ? undefined : "No URL returned" });
          } catch (err) {
            results.push({ prompt, error: `Network error: ${(err as Error).message}` });
          }
        }
        return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
      });
    },
  );
}
