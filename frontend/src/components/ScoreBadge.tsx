function riskLabel(score: number): string {
  if (score >= 67) return "Low risk";
  if (score >= 34) return "Moderate risk";
  return "High risk";
}

function riskClasses(score: number): string {
  if (score >= 67) {
    return "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
  }
  if (score >= 34) {
    return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
  }
  return "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
}

export default function ScoreBadge({ score }: { score: number }) {
  return (
    <div
      className={`inline-flex flex-col items-center gap-1 rounded-xl border px-6 py-4 ${riskClasses(score)}`}
    >
      <span className="text-3xl font-bold leading-none">{score}</span>
      <span className="text-xs font-medium uppercase tracking-wide">
        {riskLabel(score)} · name clash
      </span>
    </div>
  );
}
