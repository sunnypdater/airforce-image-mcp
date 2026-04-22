import pino from "pino";
import { requestContext } from "./context.js";

const baseLogger = pino({ level: process.env.LOG_LEVEL ?? "info" }, process.stderr);

export const logger = {
  debug: (obj: object, msg?: string) =>
    baseLogger.debug({ ...obj, ...requestContext.getStore() }, msg),
  info: (obj: object, msg?: string) =>
    baseLogger.info({ ...obj, ...requestContext.getStore() }, msg),
  warn: (obj: object, msg?: string) =>
    baseLogger.warn({ ...obj, ...requestContext.getStore() }, msg),
  error: (obj: object, msg?: string) =>
    baseLogger.error({ ...obj, ...requestContext.getStore() }, msg),
};
