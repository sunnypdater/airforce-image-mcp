#!/usr/bin/env node

const args = process.argv.slice(2);
const apiKeyArg = args.find((a) => a.startsWith("--api-key="));
if (apiKeyArg) {
  process.env.AIRFORCE_API_KEY = apiKeyArg.split("=")[1];
}

const timeoutArg = args.find((a) => a.startsWith("--timeout="));
if (timeoutArg) {
  process.env.AIRFORCE_TIMEOUT_MS = timeoutArg.split("=")[1];
}

import "./index.js";
