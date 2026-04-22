# airforce-image-mcp

MCP server for the [Airforce API](https://api.airforce) — generate images and videos, batch-generate, list models, and download media. Works with opencode, Assistant Code, Assistant Desktop, and any MCP-compatible client.

**Node.js 18+** | **MCP** | **MIT**

---

## What it does

Six tools exposed over MCP stdio transport:

| Tool | Description |
|------|-------------|
| `generate_image` | Generate images from a text prompt (13 models) |
| `generate_video` | Generate videos from a text prompt (`veo-3.1-fast`) |
| `batch_generate` | Generate images for up to 5 prompts sequentially |
| `list_models` | List all available models from the API |
| `download_image` | Download a generated image URL to local disk |
| `download_video` | Download a generated video URL to local disk (.mp4) |

---

## Prerequisites

- Node.js 18+
- Airforce API key — set as `AIRFORCE_API_KEY`

---

## Quick Start

```bash
git clone https://github.com/sunnypdater/airforce-image-mcp.git
cd airforce-image-mcp
npm install
npm run build
```

Test it works:
```bash
AIRFORCE_API_KEY=your_key node dist/index.js
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AIRFORCE_API_KEY` | ✅ | — | Your Airforce API key |
| `AIRFORCE_TIMEOUT_MS` | ❌ | `60000` | HTTP timeout in ms (increase for video: `180000`) |
| `LOG_LEVEL` | ❌ | `info` | Pino log level: `debug`, `info`, `warn`, `error` |

---

## Tools

### `generate_image`

Generate one or more images from a text prompt.

| Parameter | Type | Default | Options |
|-----------|------|---------|---------|
| `prompt` | string | required | — |
| `model` | enum | `nano-banana-2` | `nano-banana-2`, `nano-banana-pro`, `flux-2-pro`, `flux-2-dev`, `flux-2-flex`, `flux-2-klein-4b`, `flux-2-klein-9b`, `imagen-3`, `imagen-4`, `image-1`, `image-1-edit`, `gpt-image-1.5`, `z-image` |
| `n` | number (1–4) | `1` | — |
| `size` | enum | `1024x1024` | `256x256`, `512x512`, `1024x1024`, `1792x1024`, `1024x1792` |
| `response_format` | enum | `url` | `url`, `b64_json` |
| `aspectRatio` | enum | `1:1` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4` |
| `resolution` | enum | `1K` | `1K`, `2K`, `4K` |

---

### `generate_video`

Generate a video from a text prompt. Returns an `.mp4` URL.

> Note: `veo-3.1-fast` can take 60–180 seconds. Set `AIRFORCE_TIMEOUT_MS=180000` for video generation.

| Parameter | Type | Default | Options |
|-----------|------|---------|---------|
| `prompt` | string | required | — |
| `model` | enum | `veo-3.1-fast` | `veo-3.1-fast` |
| `aspectRatio` | enum | `16:9` | `16:9`, `9:16`, `1:1` |
| `resolution` | enum | `1K` | `1K`, `2K` |

---

### `batch_generate`

Generate images for up to 5 prompts sequentially. Returns a JSON array of `{ prompt, url?, error? }`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompts` | string[] (1–5) | required | Array of prompts |
| `model` | string | `nano-banana-2` | Model ID |
| `size` | enum | `1024x1024` | Image size |
| `aspectRatio` | enum | `1:1` | Aspect ratio |
| `resolution` | enum | `1K` | Resolution |

---

### `list_models`

List all available models from the Airforce API. No parameters.

---

### `download_image`

Download an image URL to local disk.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | required | Must be from `*.airforce` or `anondrop.net` |
| `outputPath` | string | `~/Downloads/airforce-{timestamp}.png` | Local save path |

---

### `download_video`

Download a video URL to local disk as `.mp4`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | required | Must be from `*.airforce` or `anondrop.net` |
| `outputPath` | string | `~/Downloads/airforce-{timestamp}.mp4` | Local save path |

---

## Install with opencode

### Step 1 — Build the server

```bash
git clone https://github.com/sunnypdater/airforce-image-mcp.git
cd airforce-image-mcp
npm install
npm run build
```

### Step 2 — Add to opencode config

Edit `~/.config/opencode/config.json` (create if it doesn't exist):

```json
{
  "mcp": {
    "servers": {
      "airforce-image": {
        "command": "node",
        "args": ["/absolute/path/to/airforce-image-mcp/dist/index.js"],
        "env": {
          "AIRFORCE_API_KEY": "your_key_here",
          "AIRFORCE_TIMEOUT_MS": "180000"
        }
      }
    }
  }
}
```

### Step 3 — Verify

Start opencode and ask:
```
list available image models
```

---

## Install with Assistant Code

### Step 1 — Build the server

```bash
git clone https://github.com/sunnypdater/airforce-image-mcp.git
cd airforce-image-mcp
npm install
npm run build
```

### Step 2 — Register via CLI

```bash
claude mcp add airforce-image \
  --command node \
  --args /absolute/path/to/airforce-image-mcp/dist/index.js \
  --env AIRFORCE_API_KEY=your_key_here \
  --env AIRFORCE_TIMEOUT_MS=180000
```

Or add manually to `~/.claude.json`:

```json
{
  "mcpServers": {
    "airforce-image": {
      "command": "node",
      "args": ["/absolute/path/to/airforce-image-mcp/dist/index.js"],
      "env": {
        "AIRFORCE_API_KEY": "your_key_here",
        "AIRFORCE_TIMEOUT_MS": "180000"
      }
    }
  }
}
```

### Step 3 — Verify

```bash
claude mcp list
```

---

## Install with Assistant Desktop

Edit `claude_desktop_config.json`:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "airforce-image": {
      "command": "node",
      "args": ["/absolute/path/to/airforce-image-mcp/dist/index.js"],
      "env": {
        "AIRFORCE_API_KEY": "your_key_here",
        "AIRFORCE_TIMEOUT_MS": "180000"
      }
    }
  }
}
```

---

## Troubleshooting

**`Error: AIRFORCE_API_KEY environment variable is required`**
Add it to your MCP client config under `env`.

**`Authentication failed — check AIRFORCE_API_KEY`**
Your key is invalid or expired.

**`Network error: request timed out`**
Video generation is slow. Set `AIRFORCE_TIMEOUT_MS=180000`.

**`Untrusted domain` on download**
Only URLs from `*.airforce` or `anondrop.net` are accepted.

**`Dynamic require of "node:os" is not supported`**
Run `npm run build` again — the build script includes `--external:pino`.

**SSE streaming**
Not supported. `sse: false` is always sent.

---

## Development

```bash
npm install
npm test
npm run test:coverage
npm run build
npm run lint
```

---

## License

MIT
