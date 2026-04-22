import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchWithTimeout } from "../http.js";
import { mcpError } from "../errors.js";
import { withRequestId } from "../context.js";
import { logger } from "../logger.js";

const API_BASE = "https://api.airforce/v1";

export function registerModelTools(server: McpServer): void {
  server.tool(
    "list_models",
    "List available image generation models from Airforce API",
    {},
    async () => {
      return withRequestId(async () => {
        logger.info({ tool: "list_models" }, "tool invoked");
        const apiKey = process.env.AIRFORCE_API_KEY!;
        try {
          const response = await fetchWithTimeout(`${API_BASE}/models`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (response.status === 401) return mcpError("Authentication failed — check AIRFORCE_API_KEY");
          if (!response.ok) return mcpError(`API error ${response.status}: ${await response.text()}`);
          const data = (await response.json()) as { data?: Array<{ id: string }> };
          const models = data.data?.map((m) => m.id).join("\n") ?? "No models found";
          return { content: [{ type: "text" as const, text: models }] };
        } catch (err) {
          return mcpError(`Network error: ${(err as Error).message}`);
        }
      });
    },
  );
}
