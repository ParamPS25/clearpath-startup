"use client";

import { FormEvent, useState } from "react";
import { CandidateInput } from "@/lib/types";

interface CandidateFormState {
  name: string;
  pitch: string;
}

const MAX_CANDIDATES = 3;
const MIN_CANDIDATES = 2;

interface CompareFormProps {
  onSubmit: (candidates: CandidateInput[], sharedPitch?: string) => void;
  isLoading: boolean;
}

export default function CompareForm({ onSubmit, isLoading }: CompareFormProps) {
  const [candidates, setCandidates] = useState<CandidateFormState[]>([
    { name: "", pitch: "" },
    { name: "", pitch: "" },
  ]);
  const [sharedPitch, setSharedPitch] = useState("");

  function updateCandidate(index: number, field: keyof CandidateFormState, value: string) {
    setCandidates((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  }

  function addCandidate() {
    if (candidates.length >= MAX_CANDIDATES) return;
    setCandidates((prev) => [...prev, { name: "", pitch: "" }]);
  }

  function removeCandidate(index: number) {
    if (candidates.length <= MIN_CANDIDATES) return;
    setCandidates((prev) => prev.filter((_, i) => i !== index));
  }

  const validCount = candidates.filter((c) => c.name.trim()).length;
  const inputClasses =
    "rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-colors";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = candidates.filter((c) => c.name.trim());
    if (valid.length < MIN_CANDIDATES) return;
    onSubmit(
      valid.map((c) => ({ name: c.name.trim(), pitch: c.pitch.trim() || undefined })),
      sharedPitch.trim() || undefined,
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl flex flex-col gap-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 shadow-sm p-7"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sharedPitch" className="text-sm font-medium">
          Shared pitch{" "}
          <span className="text-gray-500 font-normal">
            (optional — used for any candidate without its own pitch below)
          </span>
        </label>
        <textarea
          id="sharedPitch"
          value={sharedPitch}
          onChange={(e) => setSharedPitch(e.target.value)}
          rows={2}
          maxLength={500}
          disabled={isLoading}
          placeholder="One line describing the product"
          className={`${inputClasses} resize-none`}
        />
      </div>

      {candidates.map((c, i) => (
        <div
          key={i}
          className="flex flex-col gap-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Candidate {i + 1}</span>
            {candidates.length > MIN_CANDIDATES && (
              <button
                type="button"
                onClick={() => removeCandidate(i)}
                disabled={isLoading}
                className="text-xs text-gray-500 hover:text-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove
              </button>
            )}
          </div>
          <input
            type="text"
            value={c.name}
            onChange={(e) => updateCandidate(i, "name", e.target.value)}
            placeholder="Startup name"
            maxLength={100}
            required
            disabled={isLoading}
            className={`${inputClasses} bg-white dark:bg-transparent`}
          />
          <input
            type="text"
            value={c.pitch}
            onChange={(e) => updateCandidate(i, "pitch", e.target.value)}
            placeholder="Pitch override (optional)"
            maxLength={500}
            disabled={isLoading}
            className={`${inputClasses} bg-white dark:bg-transparent`}
          />
        </div>
      ))}

      {candidates.length < MAX_CANDIDATES && (
        <button
          type="button"
          onClick={addCandidate}
          disabled={isLoading}
          className="self-start text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add another candidate
        </button>
      )}

      <button
        type="submit"
        disabled={isLoading || validCount < MIN_CANDIDATES}
        className="rounded-lg bg-blue-600 text-white font-medium py-2.5 text-sm hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Comparing…" : "Compare names"}
      </button>
    </form>
  );
}
