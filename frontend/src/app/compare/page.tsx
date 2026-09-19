"use client";

import { useState } from "react";
import CompareForm from "@/components/CompareForm";
import { CompareCard, CompareErrorCard } from "@/components/CompareCard";
import { compareStartups, ApiError } from "@/lib/api";
import { CandidateInput, CompareResponse, isReportResult } from "@/lib/types";

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success"; data: CompareResponse }
  | { phase: "error"; message: string };

export default function ComparePage() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [lastInput, setLastInput] = useState<{
    candidates: CandidateInput[];
    sharedPitch?: string;
  } | null>(null);

  async function runCompare(candidates: CandidateInput[], sharedPitch?: string) {
    setLastInput({ candidates, sharedPitch });
    setState({ phase: "loading" });
    try {
      const data = await compareStartups(candidates, sharedPitch);
      setState({ phase: "success", data });
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
        <h1 className="text-2xl font-semibold tracking-tight">Compare names</h1>
        <p className="text-sm text-gray-500">
          Check 2–3 candidates side by side and see which one wins.
        </p>
      </div>

      <CompareForm onSubmit={runCompare} isLoading={state.phase === "loading"} />

      {state.phase === "loading" && (
        <p className="text-sm text-gray-500 animate-pulse">
          Validating all candidates in parallel — this can take up to a couple of
          minutes…
        </p>
      )}

      {state.phase === "error" && (
        <div className="w-full max-w-lg rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950 shadow-sm p-6 text-center flex flex-col gap-3">
          <p className="text-sm text-red-700 dark:text-red-300">{state.message}</p>
          <button
            onClick={() =>
              lastInput && runCompare(lastInput.candidates, lastInput.sharedPitch)
            }
            className="self-center rounded-lg border border-red-400 dark:border-red-700 px-4 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {state.phase === "success" && (
        <div className="w-full max-w-5xl flex flex-col gap-6">
          <div className="rounded-2xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 shadow-sm p-4 text-center">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {state.data.recommendation}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.data.results.map((r, i) =>
              isReportResult(r) ? (
                <CompareCard
                  key={`${r.name}-${i}`}
                  report={r}
                  isRecommended={r.name === state.data.recommendedName}
                />
              ) : (
                <CompareErrorCard key={`${r.name}-${i}`} name={r.name} error={r.error} />
              ),
            )}
          </div>
        </div>
      )}
    </main>
  );
}
