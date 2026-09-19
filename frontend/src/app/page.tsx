import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import {
  ChartIcon,
  CompareIcon,
  RankIcon,
  SearchIcon,
  TrendIcon,
} from "@/components/icons";
import Image from "next/image";

const HERO_TAGS = [
  { icon: SearchIcon, label: "Name conflicts" },
  { icon: ChartIcon, label: "Market landscape" },
  { icon: TrendIcon, label: "Search demand" },
  { icon: RankIcon, label: "SEO ranking" },
];

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
    icon: RankIcon,
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

        <div className="mx-auto max-w-5xl px-6 pt-16 pb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Brand intelligence for founders
            </span>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
              Before you build the<span className="text-blue-600 dark:text-blue-400"> brand</span>, know what you are building on. 
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Clearpath researches your name accross the web for name clashes, competitors, and
              demand, then gives you one cited, scored verdict - under a minute.
            </p>

            <div className="w-full max-w-md mt-2">
            <HeroSearch />
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 mt-2">
              {HERO_TAGS.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center gap-1.5 text-xs text-gray-500"
                >
                  <t.icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:perspective-[1000px]">
            <Image
              src="/hero.png"
              alt="Hero preview"
              width={500}
              height={250}
              className="rounded-xl border border-gray-200 dark:border-gray-800 lg:[transform:rotateY(-15deg)_rotateX(5deg)] shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
            />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {f.body}
                </p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
