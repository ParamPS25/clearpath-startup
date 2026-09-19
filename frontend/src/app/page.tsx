"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  timestamp: string;
};

type HealthState =
  | { phase: "loading" }
  | { phase: "success"; data: HealthResponse }
  | { phase: "error"; message: string };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export default function Home() {
  const [health, setHealth] = useState<HealthState>({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE_URL}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`Backend responded with ${res.status}`);
        return res.json();
      })
      .then((data: HealthResponse) => {
        if (!cancelled) setHealth({ phase: "success", data });
      })
      .catch((err: Error) => {
        if (!cancelled) setHealth({ phase: "error", message: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 font-sans">
      <h1 className="text-2xl font-semibold">Startup Name &amp; Market Validator</h1>
      <p className="text-sm text-gray-500">Phase 1 — foundation skeleton</p>

      <div className="rounded-lg border border-gray-200 p-4 min-w-[320px] text-center dark:border-gray-800">
        <p className="text-sm text-gray-500 mb-2">Backend health check</p>
        {health.phase === "loading" && (
          <p className="text-gray-600">Checking {API_BASE_URL}/health…</p>
        )}
        {health.phase === "success" && (
          <div>
            <p className="font-medium text-green-600">
              status: {health.data.status}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              as of {health.data.timestamp}
            </p>
          </div>
        )}
        {health.phase === "error" && (
          <p className="font-medium text-red-600">
            Failed to reach backend: {health.message}
          </p>
        )}
      </div>
    </main>
  );
}
