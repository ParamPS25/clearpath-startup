import { SearchTrend } from "@/lib/types";

const DIRECTION_LABEL: Record<SearchTrend["direction"], string> = {
  rising: "Rising interest",
  declining: "Declining interest",
  flat: "Steady interest",
  insufficient_data: "Not enough search volume",
};

const DIRECTION_CLASSES: Record<SearchTrend["direction"], string> = {
  rising:
    "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  declining:
    "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  flat: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700",
  insufficient_data:
    "bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-900 dark:text-gray-500 dark:border-gray-700",
};

const STROKE_COLOR: Record<SearchTrend["direction"], string> = {
  rising: "#16a34a",
  declining: "#dc2626",
  flat: "#6b7280",
  insufficient_data: "#9ca3af",
};

function Sparkline({ trend }: { trend: SearchTrend }) {
  const { points, direction } = trend;
  if (points.length < 2) return null;

  const width = 100;
  const height = 28;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p.value - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="shrink-0"
      aria-hidden
    >
      <polyline
        points={coords}
        fill="none"
        stroke={STROKE_COLOR[direction]}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TrendBadge({ trend }: { trend: SearchTrend }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 ${DIRECTION_CLASSES[trend.direction]}`}
    >
      <Sparkline trend={trend} />
      <span className="text-xs font-medium whitespace-nowrap">
        {DIRECTION_LABEL[trend.direction]}
      </span>
    </div>
  );
}
