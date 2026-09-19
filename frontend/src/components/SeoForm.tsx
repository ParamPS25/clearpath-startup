"use client";

import { FormEvent, useState } from "react";

const MAX_KEYWORDS = 10;

interface SeoFormProps {
  onSubmit: (
    businessName: string,
    domain: string,
    keywords: string[],
    location?: string,
  ) => void;
  isLoading: boolean;
}

export default function SeoForm({ onSubmit, isLoading }: SeoFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [domain, setDomain] = useState("");
  const [location, setLocation] = useState("");
  const [keywords, setKeywords] = useState<string[]>(["", ""]);

  function updateKeyword(index: number, value: string) {
    setKeywords((prev) => prev.map((k, i) => (i === index ? value : k)));
  }

  function addKeyword() {
    if (keywords.length >= MAX_KEYWORDS) return;
    setKeywords((prev) => [...prev, ""]);
  }

  function removeKeyword(index: number) {
    if (keywords.length <= 1) return;
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  }

  const validKeywords = keywords.map((k) => k.trim()).filter(Boolean);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !domain.trim() || validKeywords.length === 0) return;
    onSubmit(
      businessName.trim(),
      domain.trim(),
      validKeywords,
      location.trim() || undefined,
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="businessName" className="text-sm font-medium">
          Business name
        </label>
        <input
          id="businessName"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. Notion"
          maxLength={100}
          required
          disabled={isLoading}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="domain" className="text-sm font-medium">
          Domain
        </label>
        <input
          id="domain"
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="e.g. notion.com"
          maxLength={253}
          required
          disabled={isLoading}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="location" className="text-sm font-medium">
          Location <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Austin, Texas"
          maxLength={100}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Target keywords</label>
        {keywords.map((k, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={k}
              onChange={(e) => updateKeyword(i, e.target.value)}
              placeholder="e.g. note taking app"
              maxLength={100}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            {keywords.length > 1 && (
              <button
                type="button"
                onClick={() => removeKeyword(i)}
                disabled={isLoading}
                className="shrink-0 text-xs text-gray-500 hover:text-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {keywords.length < MAX_KEYWORDS && (
          <button
            type="button"
            onClick={addKeyword}
            disabled={isLoading}
            className="self-start text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add another keyword
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !businessName.trim() || !domain.trim() || validKeywords.length === 0}
        className="rounded-lg bg-blue-600 text-white font-medium py-2 text-sm hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Checking…" : "Check rankings"}
      </button>
    </form>
  );
}
