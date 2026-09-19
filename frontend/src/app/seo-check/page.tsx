"use client";

import { useState } from "react";
import SeoForm from "@/components/SeoForm";
import SeoResultCard from "@/components/SeoResultCard";
import { checkSeoRankings, ApiError } from "@/lib/api";
import { SeoRankReport } from "@/lib/types";

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success"; report: SeoRankReport }
  | { phase: "error"; message: string };

interface LastInput {
  businessName: string;
  domain: string;
  keywords: string[];
  location?: string;
}

export default function SeoCheckPage() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [lastInput, setLastInput] = useState<LastInput | null>(null);

  async function runCheck(
    businessName: string,
    domain: string,
    keywords: string[],
    location?: string,
  ) {
    setLastInput({ businessName, domain, keywords, location });
    setState({ phase: "loading" });
    try {
      const report = await checkSeoRankings(businessName, domain, keywords, location);
      setState({ phase: "success", report });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.";
      setState({ phase: "error", message });
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-56px)] flex-col items-center gap-8 px-6 py-12">
      <div className="text-center flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">SEO rank check</h1>
        <p className="text-sm text-gray-500 max-w-md">
          See where a domain currently ranks for the keywords that matter, and who&apos;s
          outranking it.
        </p>
      </div>

      <SeoForm onSubmit={runCheck} isLoading={state.phase === "loading"} />

      {state.phase === "loading" && (
        <p className="text-sm text-gray-500 animate-pulse">
          Checking rankings for every keyword — this can take up to a couple of
          minutes…
        </p>
      )}

      {state.phase === "error" && (
        <div className="w-full max-w-lg rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950 shadow-sm p-6 text-center flex flex-col gap-3">
          <p className="text-sm text-red-700 dark:text-red-300">{state.message}</p>
          <button
            onClick={() =>
              lastInput &&
              runCheck(
                lastInput.businessName,
                lastInput.domain,
                lastInput.keywords,
                lastInput.location,
              )
            }
            className="self-center rounded-lg border border-red-400 dark:border-red-700 px-4 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {state.phase === "success" && (
        <div className="w-full max-w-3xl flex flex-col gap-6">
          <div className="rounded-2xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 shadow-sm p-4 text-center">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {state.report.summary}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {state.report.results.map((r) => (
              <SeoResultCard key={r.keyword} result={r} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
