// Thin client for the JourneyLens API. Every screen reads real data through it.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Nest errors look like { statusCode, message, error }; message may be a list. */
async function readErrorMessage(response: Response) {
  try {
    const body = await response.json();
    const message = Array.isArray(body?.message)
      ? body.message.join(" ")
      : body?.message;
    if (typeof message === "string" && message.trim()) return message;
  } catch {
    // Not JSON; fall back to the status line.
  }
  return `The API responded with ${response.status} ${response.statusText}.`.trim();
}

export async function apiRequest<T>(
  path: string,
  init?: { method?: "GET" | "POST"; body?: unknown; signal?: AbortSignal }
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: init?.method ?? "GET",
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
      body: init?.body ? JSON.stringify(init.body) : undefined,
      signal: init?.signal,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(
      `Could not reach the JourneyLens API at ${API_URL}. Check that it is running.`
    );
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }
  return (await response.json()) as T;
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
