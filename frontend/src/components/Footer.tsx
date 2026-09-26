import Link from "next/link";

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
    body: "A single, cited answer - not a pile of tabs to read through yourself.",
  },
];

const FOOTER_LINKS = [
  { href: "/validate", label: "Check Name" },
  { href: "/compare", label: "Compare" },
  { href: "/seo-check", label: "SEO Rank" },
];

const GITHUB_URL = "https://github.com/ParamPS25/clearpath-startup";

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-gray-50 dark:bg-neutral-950">
      {/* How it works — merged in here rather than its own section, since a
          three-step recap didn't carry enough content to justify a full band
          on its own. Blue kept to a single accent (the CTA) rather than
          repeated across every badge, so it doesn't read as "noise" at the
          bottom of the page. */}
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pt-24 pb-20 text-center sm:pt-28">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          How it works
        </span>
        <h2 className="font-display mt-2 text-2xl sm:text-3xl font-bold text-balance">
          From a name to a verdict in three steps.
        </h2>

        <div className="relative mt-14 w-full max-w-3xl">
          <span
            aria-hidden
            className="absolute top-5 left-[16.66%] right-[16.66%] hidden h-px bg-gray-900/10 dark:bg-white/15 sm:block"
          />
          <div className="grid gap-10 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="relative z-10 flex flex-col items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-sm font-bold text-gray-700 ring-1 ring-gray-900/10 dark:bg-neutral-950 dark:text-gray-200 dark:ring-white/20">
                  {s.n.replace(/^0/, "")}
                </span>
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="font-sans text-sm text-gray-600 dark:text-gray-400 text-balance">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/validate"
          className="mt-14 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Check a name
        </Link>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 border-t border-gray-200 px-6 py-10 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold tracking-tight">
            Clearpath
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
            Brand intelligence for founders - know what you&apos;re building on
            before you build it.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>

      {/* SaaS-style signature: the brand name, huge and faint, purely decorative. */}
      <p
        aria-hidden
        className="relative select-none pointer-events-none -mt-2 sm:-mt-6 text-center font-display font-extrabold leading-none whitespace-nowrap text-gray-900/5 dark:text-white/5 text-[clamp(3rem,16vw,11rem)]"
      >
        Clearpath
      </p>
    </footer>
  );
}
