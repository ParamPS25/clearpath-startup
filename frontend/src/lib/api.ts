import { CandidateInput, CompareResponse, SeoRankReport, ValidationReport } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const REQUEST_TIMEOUT_MS = 60_000;
const COMPARE_TIMEOUT_MS = 90_000;
const SEO_TIMEOUT_MS = 90_000;

export class ApiError extends Error {}
export class NotFoundError extends ApiError {}

async function fetchWithTimeout(
  path: string,
  init?: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

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

export async function compareStartups(
  candidates: CandidateInput[],
  sharedPitch?: string,
): Promise<CompareResponse> {
  const res = await fetchWithTimeout(
    "/validate/compare",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidates,
        sharedPitch: sharedPitch || undefined,
      }),
    },
    COMPARE_TIMEOUT_MS,
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      body?.message ?? `Request failed with status ${res.status}`,
    );
  }

  return res.json();
}

export async function checkSeoRankings(
  businessName: string,
  domain: string,
  keywords: string[],
  location?: string,
): Promise<SeoRankReport> {
  const res = await fetchWithTimeout(
    "/seo-rank",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName,
        domain,
        keywords,
        location: location || undefined,
      }),
    },
    SEO_TIMEOUT_MS,
  );

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
