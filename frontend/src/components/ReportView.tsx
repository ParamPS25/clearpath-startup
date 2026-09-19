import { ValidationReport } from "@/lib/types";
import ScoreBadge from "./ScoreBadge";
import TrendBadge from "./TrendBadge";

export default function ReportView({ report }: { report: ValidationReport }) {
  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center flex flex-col items-center gap-3">
        <div>
          <p className="text-sm text-gray-500 mb-2">Overall verdict</p>
          <p className="text-lg font-semibold">{report.overallVerdict}</p>
        </div>
        {report.searchTrend && <TrendBadge trend={report.searchTrend} />}
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <ScoreBadge score={report.nameClashScore} />
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
          {report.nameClashReason}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold mb-2">Market landscape</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {report.marketSummary}
        </p>

        {report.competitors.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {report.competitors.map((c) => (
              <div
                key={c.name}
                className="rounded-lg border border-gray-200 dark:border-gray-800 p-3"
              >
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-gray-500 mt-1">{c.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No direct competitors found in the search results.
          </p>
        )}
      </div>

      {report.sources.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold mb-2">Sources</h2>
          <ul className="flex flex-col gap-1">
            {report.sources.map((s) => (
              <li key={s.url} className="text-sm truncate">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {s.title || s.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
