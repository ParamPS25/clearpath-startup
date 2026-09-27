"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import LogoMark from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { CloseIcon, MenuIcon } from "./icons";

const NAV_LINKS = [
  { href: "/validate", label: "Check Name" },
  { href: "/compare", label: "Compare" },
  { href: "/seo-check", label: "SEO Rank" },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuState, setMenuState] = useState({ open: false, pathname });

  // Close the mobile menu whenever the route actually changes (covers link
  // clicks, back/forward navigation, everything) — adjusted during render
  // rather than in an effect, per React's own guidance on this exact case.
  if (menuState.pathname !== pathname) {
    setMenuState({ open: false, pathname });
  }
  const mobileOpen = menuState.open;
  const setMobileOpen = (open: boolean) => setMenuState({ open, pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/60 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity"
        >
          <LogoMark />
          <span className="text-lg font-semibold tracking-tight">Clearpath</span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden sm:flex items-center gap-1">
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

          <div className="hidden sm:flex items-center gap-1 border-l border-gray-200 dark:border-gray-800 pl-2 ml-1">
            {status === "authenticated" ? (
              <>
                <span className="px-2 text-sm text-gray-500 truncate max-w-40">
                  {session.user?.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer transition-colors sm:hidden"
          >
            {mobileOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="sm:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-2 flex flex-col gap-0.5">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="border-t border-gray-200 dark:border-gray-800 mt-1 pt-1 flex flex-col gap-0.5">
            {status === "authenticated" ? (
              <>
                <span className="px-3 py-1 text-sm text-gray-500 truncate">
                  {session.user?.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-2.5 rounded-md text-sm font-medium text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2.5 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
