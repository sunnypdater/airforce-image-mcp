import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerGenerateTool } from "./tools/generate.js";
import { registerModelTools } from "./tools/models.js";
import { registerDownloadTool } from "./tools/download.js";
import { registerBatchTool } from "./tools/batch.js";
import { registerVideoTool } from "./tools/video.js";
import { registerDownloadVideoTool } from "./tools/download-video.js";

if (!process.env.AIRFORCE_API_KEY) {
  process.stderr.write("Error: AIRFORCE_API_KEY environment variable is required\n");
  process.exit(1);
}

export const API_BASE = "https://api.airforce/v1";

const server = new McpServer({
  name: "airforce-image-mcp",
  version: "1.0.0",
});

registerGenerateTool(server);
registerModelTools(server);
registerDownloadTool(server);
registerBatchTool(server);
registerVideoTool(server);
registerDownloadVideoTool(server);

const transport = new StdioServerTransport();
await server.connect(transport);
