import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import Footer from "@/components/Footer";
import { ChartIcon, RankIcon, SearchIcon, TrendIcon } from "@/components/icons";
import Image from "next/image";

const HERO_TAGS = [
  { icon: SearchIcon, label: "Name conflicts" },
  { icon: ChartIcon, label: "Market landscape" },
  { icon: TrendIcon, label: "Search demand" },
  { icon: RankIcon, label: "SEO ranking" },
];

const FEATURES = [
  {
    n: "01",
    title: "Check a name",
    body: "See if it clashes with existing companies, apps, or trademarks — and whether search interest in it is rising or fading.",
    href: "/validate",
    image: "/trends-block2.png",
  },
  {
    n: "02",
    title: "Market landscape",
    body: "Real competitors surfaced from live search results, with every claim cited back to its source — nothing invented.",
    href: "/validate",
    image: "/market-landscape-block.png",
  },
  {
    n: "03",
    title: "Compare candidates",
    body: "Run two or three names side by side and see which one wins, with the reasoning shown plainly.",
    href: "/compare",
    image: "/compare3-block.png",
  },
  {
    n: "04",
    title: "SEO rank check",
    body: "See where a domain ranks for the keywords that matter, and exactly who's outranking it.",
    href: "/seo-check",
    image: "/seo-blockk.png",
  },
];

export default function LandingPage() {
  return (
    <>
    <main className="flex flex-col items-center">
      <section className="relative w-full overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 flex justify-center"
        >
          <div className="h-105 w-180 translate-y-[-40%] rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-16 pb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Brand intelligence for founders
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-normal text-balance leading-[1.1]">
              Before you build the<span className="text-blue-600 dark:text-blue-400"> brand</span>, know what you are building on.
            </h1>
            <p className="font-sans text-base sm:text-lg text-gray-600 dark:text-gray-400 text-balance">
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

      <section className="relative w-full">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 max-w-xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance">
              What it checks
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-balance">
              One name, four real signals — pulled from live search results and cited
              back to their source, not guessed by a model.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-2 p-5">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {f.n}
                  </span>
                  <h3 className="font-display text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-md text-gray-600 dark:text-gray-400">{f.body}</p>
                </div>
                <div className="relative w-full aspect-16/10 overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <Image
                    src={f.image}
                    alt={`${f.title} preview`}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}
