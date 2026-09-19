import { KeywordRankResult } from "@/lib/types";

function positionBadgeClasses(position: number | null): string {
  if (position === null) {
    return "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
  }
  if (position <= 3) {
    return "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
  }
  if (position <= 10) {
    return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
  }
  return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700";
}

export default function SeoResultCard({ result }: { result: KeywordRankResult }) {
  const { keyword, position, topCompetitors, explanation } = result;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 shadow-sm p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{keyword}</h3>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${positionBadgeClasses(position)}`}
        >
          {position === null ? "Not in top 20" : `Rank #${position}`}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">{explanation}</p>

      {topCompetitors.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {position === null ? "Top results" : "Ranking above you"}
          </p>
          <ul className="flex flex-col gap-1.5">
            {topCompetitors.map((c) => (
              <li key={c.url} className="text-sm truncate">
                <span className="text-gray-400 mr-1.5">#{c.position}</span>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {c.title || c.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
