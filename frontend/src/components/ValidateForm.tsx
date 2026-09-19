"use client";

import { FormEvent, useState } from "react";

interface ValidateFormProps {
  onSubmit: (name: string, pitch: string) => void;
  isLoading: boolean;
}

export default function ValidateForm({ onSubmit, isLoading }: ValidateFormProps) {
  const [name, setName] = useState("");
  const [pitch, setPitch] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), pitch.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Startup name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Notion"
          maxLength={100}
          required
          disabled={isLoading}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="pitch" className="text-sm font-medium">
          Pitch <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <textarea
          id="pitch"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          placeholder="One line describing what it does — helps find the right competitors"
          maxLength={500}
          rows={3}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="rounded-lg bg-blue-600 text-white font-medium py-2 text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Validating…" : "Validate"}
      </button>
    </form>
  );
}
