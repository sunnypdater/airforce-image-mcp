export interface MockResponse {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
  throws?: boolean;
}

export function mockFetch(responses: MockResponse[]): void {
  let callIndex = 0;
  global.fetch = async (_url: string, _options?: RequestInit): Promise<Response> => {
    const mock = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    if (mock.throws) throw new Error(typeof mock.body === "string" ? mock.body : "Network error");
    const bodyText = typeof mock.body === "string" ? mock.body : JSON.stringify(mock.body);
    return new Response(bodyText, {
      status: mock.status,
      headers: { "Content-Type": "application/json", ...mock.headers },
    });
  };
}

export function restoreFetch(): void {}
