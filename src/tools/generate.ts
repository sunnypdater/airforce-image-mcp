import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchWithTimeout } from "../http.js";
import { mcpError } from "../errors.js";
import { validatePromptWithParams } from "../validation.js";
import { withRequestId } from "../context.js";
import { logger } from "../logger.js";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const API_BASE = "https://api.airforce/v1";

export function registerGenerateTool(server: McpServer): void {
  server.tool(
    "generate_image",
    "Generate an image using the Airforce image generation API",
    {
      prompt: z.string().describe("Text prompt describing the image to generate"),
      model: z
        .enum([
          "nano-banana-2",
          "nano-banana-pro",
          "flux-2-pro",
          "flux-2-dev",
          "flux-2-flex",
          "flux-2-klein-4b",
          "flux-2-klein-9b",
          "imagen-3",
          "imagen-4",
          "image-1",
          "image-1-edit",
          "gpt-image-1.5",
          "z-image",
        ])
        .optional()
        .default("flux-2-pro")
        .describe("Image model to use for generation"),
      n: z.number().int().min(1).max(4).optional().default(1).describe("Number of images to generate"),
      size: z.enum(["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]).optional().default("1024x1024").describe("Image size"),
      response_format: z.enum(["url", "b64_json"]).optional().default("b64_json").describe("Response format"),
      aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).optional().default("1:1").describe("Aspect ratio"),
      resolution: z.enum(["1K", "2K", "4K"]).optional().default("1K").describe("Image resolution"),
    },
    async ({ prompt, model, n, size, response_format, aspectRatio, resolution }) => {
      return withRequestId(async () => {
        logger.info({ tool: "generate_image", prompt: prompt.slice(0, 80) }, "tool invoked");
        const validation = validatePromptWithParams(prompt, n, resolution);
        if (!validation.valid) return mcpError(validation.error!);
        const apiKey = process.env.AIRFORCE_API_KEY!;
        try {
          const response = await fetchWithTimeout(`${API_BASE}/images/generations`, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model, prompt, n, size, response_format, sse: false, aspectRatio, resolution }),
          });
          if (response.status === 401) return mcpError("Authentication failed — check AIRFORCE_API_KEY");
          if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After") ?? "unknown";
            return mcpError(`Rate limit exceeded — retry after ${retryAfter}s`);
          }
          if (!response.ok) return mcpError(`API error ${response.status}: ${await response.text()}`);
          const data = (await response.json()) as { data?: Array<{ url?: string; b64_json?: string }> };
          if (!data.data || data.data.length === 0) return mcpError("No images returned from API");
          const content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }> = [];
          for (const img of data.data) {
            if (response_format === "url" && img.url) content.push({ type: "text", text: img.url });
            else if (response_format === "b64_json" && img.b64_json) {
              const outDir = join(process.cwd(), "output");
              mkdirSync(outDir, { recursive: true });
              const filename = `image-${Date.now()}.png`;
              const filepath = join(outDir, filename);
              writeFileSync(filepath, Buffer.from(img.b64_json, "base64"));
              content.push({ type: "image", data: img.b64_json, mimeType: "image/png" });
              content.push({ type: "text", text: `Saved to: ${filepath}` });
            }
          }
          return { content };
        } catch (err) {
          return mcpError(`Network error: ${(err as Error).message}`);
        }
      });
    },
  );
}
