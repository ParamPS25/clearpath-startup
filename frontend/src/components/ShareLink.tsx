"use client";

import { useState } from "react";

export default function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — link is still
      // visible and selectable in the input, so this is a silent no-op.
    }
  }

  return (
    <div className="w-full max-w-2xl flex items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="flex-1 min-w-0 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-xs truncate"
      />
      <button
        onClick={copy}
        className="shrink-0 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
