# Changelog

## v1.0.0 — 2026-04-22

### Added
- `generate_image` tool with prompt validation, error handling, and timeout support (13 image models, strict enum)
- `generate_video` tool (`veo-3.1-fast`, returns `.mp4` URL)
- `batch_generate` tool for up to 5 sequential prompts
- `list_models` tool
- `download_image` tool with trusted-domain validation
- `download_video` tool (saves `.mp4` to disk)
- `src/http.ts` — `fetchWithTimeout` with AbortController and 429 retry logic (up to 2 retries)
- `src/validation.ts` — prompt length, control char, and combo validation
- `src/errors.ts` — typed error classes and `mcpError` helper
- `src/logger.ts` — pino structured logging to stderr
- `src/context.ts` — `AsyncLocalStorage` request ID tracing
- Vitest test suite with 38 tests, ≥70% line coverage
- Dockerfile (Node 18 Alpine)
- GitHub Actions CI and publish workflows
- ESLint with TypeScript rules

### Security
- No hardcoded API key; server exits on startup if `AIRFORCE_API_KEY` is not set

### Build
- esbuild with `--external:pino` to avoid CommonJS require crash on Node 22
