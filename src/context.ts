import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";

export const requestContext = new AsyncLocalStorage<{ requestId: string }>();

export function withRequestId<T>(fn: () => Promise<T>): Promise<T> {
  return requestContext.run({ requestId: randomUUID() }, fn);
}
