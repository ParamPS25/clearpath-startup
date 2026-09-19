import { ValidationReport } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const REQUEST_TIMEOUT_MS = 60_000;

export class ApiError extends Error {}

export async function validateStartup(
  name: string,
  pitch?: string,
): Promise<ValidationReport> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pitch: pitch || undefined }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        "The request took too long to respond. Please try again.",
      );
    }
    throw new ApiError(
      "Could not reach the server. Check that the backend is running and try again.",
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      body?.message ?? `Request failed with status ${res.status}`,
    );
  }

  return res.json();
}
