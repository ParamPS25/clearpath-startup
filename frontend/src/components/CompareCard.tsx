import { ValidationReport } from "@/lib/types";
import ScoreBadge from "./ScoreBadge";

export function CompareCard({
  report,
  isRecommended,
}: {
  report: ValidationReport;
  isRecommended: boolean;
}) {
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
      <p className="text-sm text-gray-600 dark:text-gray-400">{report.overallVerdict}</p>
      <p className="text-xs text-gray-500">
        {report.competitors.length === 0
          ? "No direct competitors found"
          : `${report.competitors.length} competitor${report.competitors.length === 1 ? "" : "s"} found`}
      </p>
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
