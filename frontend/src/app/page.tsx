import Link from "next/link";
import { ChartIcon, CompareIcon, SearchIcon, TrendIcon } from "@/components/icons";

const FEATURES = [
  {
    icon: SearchIcon,
    title: "Check a name",
    body: "See if it clashes with existing companies, apps, or trademarks — and whether search interest in it is rising or fading.",
    href: "/validate",
  },
  {
    icon: ChartIcon,
    title: "Market landscape",
    body: "Real competitors surfaced from live search results, with every claim cited back to its source — nothing invented.",
    href: "/validate",
  },
  {
    icon: CompareIcon,
    title: "Compare candidates",
    body: "Run two or three names side by side and see which one wins, with the reasoning shown plainly.",
    href: "/compare",
  },
  {
    icon: TrendIcon,
    title: "SEO rank check",
    body: "See where a domain ranks for the keywords that matter, and exactly who's outranking it.",
    href: "/seo-check",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Enter a name",
    body: "Add an optional one-line pitch so the search knows what market to look at.",
  },
  {
    n: "02",
    title: "We search and synthesize",
    body: "Searches run in parallel, and the raw results get turned into a scored, structured report.",
  },
  {
    n: "03",
    title: "Get a verdict",
    body: "A single, cited answer — not a pile of tabs to read through yourself.",
  },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center">
      <section className="relative w-full overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 flex justify-center"
        >
          <div className="h-105 w-180 translate-y-[-40%] rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center flex flex-col items-center gap-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Startup name toolkit
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
            Know if the name is taken before you build the brand.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl text-balance">
            Clearpath searches the web for name clashes and competitors, then gives
            you one cited, scored verdict — in under a minute instead of twenty.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Link
              href="/validate"
              className="rounded-lg bg-blue-600 text-white font-medium px-5 py-2.5 text-sm hover:bg-blue-700 transition-colors"
            >
              Check a name
            </Link>
            <Link
              href="/compare"
              className="rounded-lg border border-gray-300 dark:border-gray-700 font-medium px-5 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              Compare 2–3 names
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-6">
            What it checks
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-sm transition-all"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{f.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-6">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col gap-2">
                <span className="text-3xl font-semibold text-gray-300 dark:text-gray-700">
                  {s.n}
                </span>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
