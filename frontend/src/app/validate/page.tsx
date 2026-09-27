"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ValidateForm from "@/components/ValidateForm";
import ReportView from "@/components/ReportView";
import ShareLink from "@/components/ShareLink";
import { validateStartup, ApiError, UnauthorizedError } from "@/lib/api";
import { ValidationReport } from "@/lib/types";

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success"; report: ValidationReport }
  | { phase: "error"; message: string };

function ValidatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialName = searchParams.get("name") ?? "";

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
      if (err instanceof UnauthorizedError) {
        router.push("/login?callbackUrl=/validate");
        return;
      }
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
        <h1 className="text-2xl font-semibold tracking-tight">Check a name</h1>
        <p className="text-sm text-gray-500">
          See if it&apos;s taken, how crowded the market is, and where search interest
          is headed.
        </p>
      </div>

      <ValidateForm
        onSubmit={runValidation}
        isLoading={state.phase === "loading"}
        initialName={initialName}
      />

      {state.phase === "loading" && (
        <p className="text-sm text-gray-500 animate-pulse">
          Searching the web and synthesizing a report — this can take up to a minute…
        </p>
      )}

      {state.phase === "error" && (
        <div className="w-full max-w-lg rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950 shadow-sm p-6 text-center flex flex-col gap-3">
          <p className="text-sm text-red-700 dark:text-red-300">{state.message}</p>
          <button
            onClick={() => lastInput && runValidation(lastInput.name, lastInput.pitch)}
            className="self-center rounded-lg border border-red-400 dark:border-red-700 px-4 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer transition-colors"
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

export default function ValidatePage() {
  return (
    <Suspense fallback={null}>
      <ValidatePageContent />
    </Suspense>
  );
}
