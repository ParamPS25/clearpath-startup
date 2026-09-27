import { getSession } from "next-auth/react";
import { CandidateInput, CompareResponse, SeoRankReport, ValidationReport } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const REQUEST_TIMEOUT_MS = 60_000;
const COMPARE_TIMEOUT_MS = 90_000;
const SEO_TIMEOUT_MS = 90_000;

export class ApiError extends Error {}
export class NotFoundError extends ApiError {}
export class UnauthorizedError extends ApiError {}

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

// Wraps fetchWithTimeout with the current session's access token - used for
// the endpoints the backend now guards (/validate, /validate/compare,
// /seo-rank). The NextAuth jwt callback already keeps the token fresh, so a
// 401 here means the session is genuinely gone, not just stale.
async function authorizedFetch(
  path: string,
  init?: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const session = await getSession();

  const res = await fetchWithTimeout(
    path,
    {
      ...init,
      headers: {
        ...init?.headers,
        ...(session?.accessToken
          ? { Authorization: `Bearer ${session.accessToken}` }
          : {}),
      },
    },
    timeoutMs,
  );

  if (res.status === 401) {
    throw new UnauthorizedError("You need to log in to do that.");
  }

  return res;
}

export async function validateStartup(
  name: string,
  pitch?: string,
): Promise<ValidationReport> {
  const res = await authorizedFetch("/validate", {
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
  const res = await authorizedFetch(
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
  const res = await authorizedFetch(
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
