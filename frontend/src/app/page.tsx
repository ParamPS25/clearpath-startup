"use client";

import { useState } from "react";
import Link from "next/link";
import ValidateForm from "@/components/ValidateForm";
import ReportView from "@/components/ReportView";
import ShareLink from "@/components/ShareLink";
import { validateStartup, ApiError } from "@/lib/api";
import { ValidationReport } from "@/lib/types";

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success"; report: ValidationReport }
  | { phase: "error"; message: string };

export default function Home() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [lastInput, setLastInput] = useState<{ name: string; pitch: string } | null>(
    null,
  );

  async function runValidation(name: string, pitch: string) {
    setLastInput({ name, pitch });
    setState({ phase: "loading" });
    try {
      const report = await validateStartup(name, pitch);
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
    <main className="flex min-h-screen flex-col items-center gap-8 p-8 font-sans">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Startup Name &amp; Market Validator</h1>
        <p className="text-sm text-gray-500 mt-1">
          Check name clash risk and market crowding before you commit.
        </p>
        <Link
          href="/compare"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
        >
          Compare 2–3 candidate names →
        </Link>
      </div>

      <ValidateForm onSubmit={runValidation} isLoading={state.phase === "loading"} />

      {state.phase === "loading" && (
        <p className="text-sm text-gray-500 animate-pulse">
          Searching the web and synthesizing a report — this can take up to a minute…
        </p>
      )}

      {state.phase === "error" && (
        <div className="w-full max-w-lg rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6 text-center flex flex-col gap-3">
          <p className="text-sm text-red-700 dark:text-red-300">{state.message}</p>
          <button
            onClick={() => lastInput && runValidation(lastInput.name, lastInput.pitch)}
            className="self-center rounded-lg border border-red-400 dark:border-red-700 px-4 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {state.phase === "success" && (
        <>
          {state.report.id && (
            <ShareLink url={`${window.location.origin}/report/${state.report.id}`} />
          )}
          <ReportView report={state.report} />
        </>
      )}
    </main>
  );
}
