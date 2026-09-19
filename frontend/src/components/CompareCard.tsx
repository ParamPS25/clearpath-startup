"use client";

import { useState } from "react";
import { ValidationReport } from "@/lib/types";
import ScoreBadge from "./ScoreBadge";
import TrendBadge from "./TrendBadge";

export function CompareCard({
  report,
  isRecommended,
}: {
  report: ValidationReport;
  isRecommended: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const count = report.competitors.length;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-5 ${
        isRecommended
          ? "border-blue-500 ring-2 ring-blue-500/30"
          : "border-gray-200 dark:border-gray-800"
      }`}
    >
      {isRecommended && (
        <span className="self-start rounded-full bg-blue-600 text-white text-xs font-medium px-2 py-0.5">
          Recommended
        </span>
      )}
      <h3 className="font-semibold text-lg truncate">{report.name}</h3>
      <ScoreBadge score={report.nameClashScore} />
      {report.searchTrend && <TrendBadge trend={report.searchTrend} />}
      <p className="text-sm text-gray-600 dark:text-gray-400">{report.overallVerdict}</p>

      {count === 0 ? (
        <p className="text-xs text-gray-500">No direct competitors found</p>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="self-start flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer"
          >
            <span>{`${count} competitor${count === 1 ? "" : "s"} found`}</span>
            <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
          </button>

          {expanded && (
            <ul className="flex flex-col gap-2">
              {report.competitors.map((c) => (
                <li
                  key={c.name}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 p-2"
                >
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function CompareErrorCard({ name, error }: { name: string; error: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950 p-5">
      <h3 className="font-semibold text-lg truncate">{name}</h3>
      <p className="text-sm text-red-700 dark:text-red-300">Failed to validate: {error}</p>
    </div>
  );
}
