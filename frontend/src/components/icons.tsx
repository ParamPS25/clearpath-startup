type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  );
}

export function CompareIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7 3v14M7 17l-3-3M7 17l3-3" />
      <path d="M17 21V7M17 7l3 3M17 7l-3 3" />
    </svg>
  );
}

export function TrendIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 6h6v6" />
    </svg>
  );
}

export function RankIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6h10M4 12h16M4 18h7" />
    </svg>
  );
}
