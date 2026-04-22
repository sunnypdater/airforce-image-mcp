import { logger } from "./logger.js";

const DEFAULT_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;
const MAX_WAIT_MS = 30_000;

export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs?: number,
): Promise<Response> {
  const ms = timeoutMs ?? Number(process.env.AIRFORCE_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    const start = Date.now();

    logger.debug({ url, method: options.method ?? "GET", attempt }, "http request start");

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      const latencyMs = Date.now() - start;
      logger.debug({ url, status: response.status, latencyMs }, "http response");

      if (response.status === 429 && attempt < MAX_RETRIES) {
        const retryAfter = response.headers.get("Retry-After");
        const waitMs = Math.min(
          retryAfter ? Number(retryAfter) * 1000 : 5_000,
          MAX_WAIT_MS,
        );
        logger.warn({ url, attempt, waitMs }, "rate limited, retrying");
        await new Promise((r) => setTimeout(r, waitMs));
        attempt++;
        continue;
      }

      return response;
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        throw new Error(`Request timed out after ${ms}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
