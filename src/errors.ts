export class AirforceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "AirforceError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function mcpError(msg: string): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  return { content: [{ type: "text", text: msg }], isError: true };
}
