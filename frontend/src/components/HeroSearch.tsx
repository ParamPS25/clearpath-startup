"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./icons";

const EXAMPLES = ["Nextria", "Voltix", "Northstar", "Arcwell"];

export default function HeroSearch() {
  const [name, setName] = useState("");
  const router = useRouter();

  function goToValidate(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/validate?name=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    goToValidate(name);
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/60 px-3.5 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
          <SearchIcon className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a startup name…"
            maxLength={100}
            className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim()}
          className="shrink-0 rounded-lg bg-blue-600 text-white font-medium px-4 py-2.5 text-sm hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Analyze →
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span>Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setName(ex)}
            className="rounded-full border border-gray-300 dark:border-gray-700 px-2.5 py-0.5 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
