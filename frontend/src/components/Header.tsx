"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/validate", label: "Validate" },
  { href: "/compare", label: "Compare" },
  { href: "/seo-check", label: "SEO Check" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight shrink-0 hover:opacity-80 transition-opacity"
        >
          Clearpath
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
