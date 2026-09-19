import { ValidationReport } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const REQUEST_TIMEOUT_MS = 60_000;

export class ApiError extends Error {}
export class NotFoundError extends ApiError {}

async function fetchWithTimeout(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...init,
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
}

export async function validateStartup(
  name: string,
  pitch?: string,
): Promise<ValidationReport> {
  const res = await fetchWithTimeout("/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pitch: pitch || undefined }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      body?.message ?? `Request failed with status ${res.status}`,
    );
  }

  return res.json();
}

export async function getReport(id: string): Promise<ValidationReport> {
  // Reports are immutable once created, so cache indefinitely per id.
  const res = await fetchWithTimeout(`/reports/${encodeURIComponent(id)}`, {
    cache: "force-cache",
  });

  if (res.status === 404) {
    throw new NotFoundError("Report not found");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      body?.message ?? `Request failed with status ${res.status}`,
    );
  }

  return res.json();
}
